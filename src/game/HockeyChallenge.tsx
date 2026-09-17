import { useEffect, useRef, useState } from "react";
import { birthday } from "../config";
import { playGoalCelebration, playPuckHit, playSaveSound } from "../audio/arenaAudio";
import { playArenaDetail, setMix } from "../audio/AudioDirector";
import * as art from "./pixelArt";
import {
  TUNING,
  goalieBaseY,
  goalieBoxes,
  makeGoalie,
  makeNet,
  shotError,
  shotOutcome,
  shotSpeed,
  updateGoalie,
  type Outcome,
  type Shot,
} from "./shootout";

type Props = {
  onWin: () => void;
};

/** Logical pixels on the short side; CSS scales the canvas up crisply. Phones get chunkier pixels. */
const LOGICAL = 270;
const LOGICAL_PORTRAIT = 200;
const PLAYER_RANGE = 56;

type Phase = "aim" | "flight" | "result" | "won";

const MISS_COPY: Record<Exclude<Outcome, "goal">, string> = {
  save: "SAVE! GO FOR A CORNER",
  post: "DING! OFF THE POST",
  crossbar: "DING! OFF THE BAR",
  wide: "WIDE! AIM INSIDE THE RED",
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function HockeyChallenge({ onWin }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [shots, setShots] = useState(0);
  const [scored, setScored] = useState(false);
  const [message, setMessage] = useState("HOLD TO CHARGE · RELEASE TO SHOOT");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.focus();

    let layout: art.Layout;
    // No layout until the canvas has a real, non-zero size (see resize).
    let ready = false;
    let sized = "";
    let rink: HTMLCanvasElement;
    let crowd: HTMLCanvasElement[] = [];
    let frame = 0;
    let last = performance.now();
    let real = 0; // wall-clock seconds
    let clock = 0; // game seconds (slows down for the winning shot)
    let timeScale = 1;
    let shake = 0;
    let lampOn = false;
    let resultTimer = 0;
    let winTimer = 0;
    let shotCount = 0;

    let phase: Phase = "aim";
    let misses = 0;
    let charging = false;
    let chargeStart = 0; // wall-clock ms, so charging works even at a low frame rate
    let power = 0;
    let heldAtMax = 0;
    let follow = 0;
    let lastTouch: { x: number; y: number } | null = null;
    const keys = new Set<string>();

    const goalie = makeGoalie(0);
    const player = { x: 0, targetX: 0 };
    const aim = { x: 0, y: 0 };
    const puck = { x: 0, y: 0, ground: 0 };
    const trail: { x: number; y: number }[] = [];
    let shot: (Shot & { fromX: number; fromY: number; duration: number; t: number; power: number }) | null = null;
    let bounce: { vx: number; vy: number } | null = null;
    let ripple: { x: number; y: number; t: number } | null = null;
    let slowMoChecked = false;

    const puckRest = () => ({ x: player.x - 6, y: layout.playerY - 1 });

    const resetPuck = () => {
      const rest = puckRest();
      puck.x = rest.x;
      puck.y = puck.ground = rest.y;
      shot = null;
      bounce = null;
      follow = 0;
      trail.length = 0;
    };

    // Driven by a ResizeObserver: the overlay can mount before it has a size (0×0 on the
    // first frame), and a 0-sized layout used to throw in drawImage and kill the loop.
    const resize = () => {
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      if (cw <= 0 || ch <= 0) return;
      const landscape = cw >= ch;
      const w = landscape ? Math.round((LOGICAL * cw) / ch) : LOGICAL_PORTRAIT;
      const h = landscape ? LOGICAL : Math.round((LOGICAL_PORTRAIT * ch) / cw);
      if (w <= 0 || h <= 0 || `${w}x${h}` === sized) return;
      sized = `${w}x${h}`;
      canvas.width = w;
      canvas.height = h;
      ctx.imageSmoothingEnabled = false;

      const cx = Math.floor(w / 2);
      layout = art.makeLayout(w, h, makeNet(cx, Math.round(h * 0.42)));
      rink = art.renderRink(layout);
      crowd = [art.renderCrowd(layout, 0), art.renderCrowd(layout, 1)];
      goalie.x = cx;
      player.x = player.targetX = cx;
      aim.x = cx + 28;
      aim.y = layout.net.top + 9;
      if (phase === "aim") resetPuck();
      ready = true;
    };

    const setAim = (x: number, y: number) => {
      if (!ready) return;
      const { net, cx } = layout;
      aim.x = clamp(x, net.left - 10, net.right + 10);
      aim.y = clamp(y, net.top - 8, net.line - 1);
      // The shooter drifts a little toward the side being aimed at, changing the angle.
      if (!charging) player.targetX = clamp(cx + (aim.x - cx) * 0.6, cx - PLAYER_RANGE, cx + PLAYER_RANGE);
    };

    // Holding a full charge too long makes the aim drift a little.
    const wobble = () => Math.sin(clock * 9) * Math.min(2.5, heldAtMax * 2);

    const startCharge = () => {
      if (!ready || phase !== "aim" || charging) return;
      charging = true;
      chargeStart = performance.now();
    };

    const fire = () => {
      if (phase !== "aim" || !charging) return;
      measurePower();
      charging = false;
      const p = Math.max(0.15, power);
      const from = puckRest();
      const x = aim.x + wobble() + shotError(p);
      const y = aim.y + shotError(p) * 0.5;
      shot = {
        x,
        y,
        releasedAt: clock,
        fromX: from.x,
        fromY: from.y,
        duration: Math.hypot(x - from.x, y - from.y) / shotSpeed(p),
        t: 0,
        power: p,
      };
      phase = "flight";
      power = 0;
      heldAtMax = 0;
      slowMoChecked = false;
      shotCount += 1;
      setShots(shotCount);
      setMessage(p < 0.4 ? "WEAK SHOT…" : "SHOT!");
      playPuckHit(p);
    };

    const resolve = () => {
      if (!shot) return;
      const outcome = shotOutcome(shot.x, shot.y, layout.net, goalieBoxes(goalie, layout.net));

      if (outcome === "goal") {
        phase = "won";
        lampOn = true;
        shake = 5;
        ripple = { x: shot.x, y: shot.y, t: 0 };
        puck.y = shot.y - 1;
        setScored(true);
        setMessage("GOAL!!!");
        setMix("goal");
        playGoalCelebration();
        window.setTimeout(() => (timeScale = 1), 700);
        winTimer = window.setTimeout(onWin, 2800);
        return;
      }

      misses += 1;
      phase = "result";
      timeScale = 1;
      if (outcome === "save") {
        bounce = { vx: Math.sign(shot.x - goalie.x || 1) * 140, vy: 90 };
        shake = 2;
        playSaveSound("save");
      } else if (outcome === "wide") {
        bounce = { vx: (shot.x - shot.fromX) * 0.6, vy: -30 };
        shake = 1;
        playArenaDetail("boards");
      } else {
        bounce = { vx: (Math.random() - 0.5) * 140, vy: 170 };
        shake = 3;
        playSaveSound("post");
      }
      const weak = shot.power < 0.4 && outcome === "save";
      setMessage(weak ? "SAVE! HOLD LONGER FOR POWER" : MISS_COPY[outcome]);
      resultTimer = window.setTimeout(() => {
        phase = "aim";
        resetPuck();
        playArenaDetail("puckSlide"); // a new puck is fed to the shooter
        setMessage(misses >= 2 ? "GOALIE'S TIRING · AIM HIGH IN A CORNER" : "HOLD TO CHARGE · RELEASE TO SHOOT");
      }, 1300);
    };

    function measurePower() {
      const held = (performance.now() - chargeStart) / 1000;
      power = Math.min(1, held / TUNING.chargeTime);
      heldAtMax = Math.max(0, held - TUNING.chargeTime);
    }

    const pushTrail = () => {
      trail.push({ x: puck.x, y: puck.y });
      if (trail.length > 10) trail.shift();
    };

    const update = (dt: number) => {
      const { net } = layout;

      const kx = (keys.has("ArrowRight") ? 1 : 0) - (keys.has("ArrowLeft") ? 1 : 0);
      const ky = (keys.has("ArrowDown") ? 1 : 0) - (keys.has("ArrowUp") ? 1 : 0);
      if (kx || ky) setAim(aim.x + kx * 70 * dt, aim.y + ky * 45 * dt);

      if (phase === "aim") {
        player.x += clamp(player.targetX - player.x, -60 * dt, 60 * dt);
        const rest = puckRest();
        puck.x = rest.x;
        puck.y = puck.ground = rest.y;
        if (charging) measurePower();
      } else {
        follow = Math.min(1, follow + dt * 7);
      }

      updateGoalie(goalie, dt, clock, net, player.x, phase === "aim" ? null : shot, misses);

      if (phase === "flight" && shot) {
        shot.t += dt;
        const p = Math.min(1, shot.t / shot.duration);
        puck.x = shot.fromX + (shot.x - shot.fromX) * p;
        puck.y = shot.fromY + (shot.y - shot.fromY) * p;
        puck.ground = shot.fromY + (net.line + 1 - shot.fromY) * p;
        pushTrail();

        // Slow motion once the shot is going in whatever the goalie does from here.
        if (!slowMoChecked && p > 0.55) {
          slowMoChecked = true;
          const reach = Math.abs(goalie.v) * (shot.duration - shot.t) + 4;
          const worst = goalieBoxes(goalie, net).map((b) => ({ ...b, x: b.x - reach, w: b.w + reach * 2 }));
          if (shotOutcome(shot.x, shot.y, net, worst) === "goal") timeScale = 0.22;
        }
        if (p >= 1) resolve();
      } else if (bounce) {
        puck.x += bounce.vx * dt;
        puck.y += bounce.vy * dt;
        puck.ground = puck.y;
        bounce.vx *= 0.97;
        bounce.vy *= 0.97;
        pushTrail();
      } else if (trail.length) {
        trail.shift();
      }

      if (ripple) ripple.t += dt;
      shake = Math.max(0, shake - dt * 14);
      frame = lampOn ? Math.floor(real * 7) % 2 : Math.floor(real / 1.1) % 2;
    };

    const draw = () => {
      const { w, h, net, playerY } = layout;
      ctx.save();
      if (shake > 0) {
        ctx.translate(Math.round((Math.random() - 0.5) * 2 * shake), Math.round((Math.random() - 0.5) * 2 * shake));
      }
      ctx.fillStyle = "#0d1712";
      ctx.fillRect(-6, -6, w + 12, h + 12);
      ctx.drawImage(crowd[frame], 0, 0);
      ctx.drawImage(rink, 0, 0);
      art.drawGoalLamp(ctx, layout, lampOn, real);
      art.drawNet(ctx, net, ripple);

      // A scored puck sits behind the goalie; everything else is in front.
      const inNet = phase === "won";
      if (inNet) art.drawPuck(ctx, puck.x, puck.y, null);
      art.drawGoalie(ctx, goalie.pose, Math.round(goalie.x), goalieBaseY(net));
      art.drawTrail(ctx, trail);
      if (!inNet) art.drawPuck(ctx, puck.x, puck.y, puck.ground);

      const x = Math.round(player.x);
      art.drawPlayer(ctx, x, playerY, charging ? power : 0, follow, birthday.playerNumber);

      if (phase === "aim") {
        const color = art.powerColor(charging ? power : 1);
        const blink = !charging && Math.floor(real * 3) % 3 === 0;
        art.drawReticle(ctx, Math.round(aim.x + (charging ? wobble() : 0)), Math.round(aim.y), color, blink);
        if (charging) art.drawPowerBar(ctx, x + 14, playerY - 30, power);
      }

      if (lampOn) {
        ctx.globalAlpha = 0.08 + Math.abs(Math.sin(real * 8)) * 0.08;
        ctx.fillStyle = "#ff2a3a";
        ctx.fillRect(-6, -6, w + 12, h + 12);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    };

    let raf = 0;
    const loop = (now: number) => {
      // Schedule first: a throw below must never stop the game.
      raf = requestAnimationFrame(loop);
      // The first rAF timestamp can predate the `last` taken at setup; a negative dt made
      // `real` negative and indexed crowd[-1] (the old intermittent blank screen).
      const dtReal = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      if (!ready) return;
      real += dtReal;
      const dt = dtReal * timeScale;
      clock += dt;
      try {
        update(dt);
        draw();
      } catch (error) {
        console.error("shootout frame failed", error);
      }
    };

    const toLogical = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) * canvas.width) / r.width, y: ((e.clientY - r.top) * canvas.height) / r.height };
    };

    const onPointerDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const p = toLogical(e);
      if (e.pointerType === "mouse") setAim(p.x, p.y);
      else lastTouch = p; // touch moves the reticle relatively so the finger never hides it
      startCharge();
    };

    const onPointerMove = (e: PointerEvent) => {
      const p = toLogical(e);
      if (e.pointerType === "mouse") setAim(p.x, p.y);
      else if (lastTouch) {
        setAim(aim.x + (p.x - lastTouch.x) * 0.8, aim.y + (p.y - lastTouch.y) * 0.8);
        lastTouch = p;
      }
    };

    const onPointerUp = () => {
      lastTouch = null;
      fire();
      charging = false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.startsWith("Arrow")) {
        keys.add(e.key);
        e.preventDefault();
      }
      if ((e.key === " " || e.key === "Enter") && !e.repeat) {
        startCharge();
        e.preventDefault();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keys.delete(e.key);
      if (e.key === " " || e.key === "Enter") fire();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("keydown", onKeyDown);
    canvas.addEventListener("keyup", onKeyUp);
    raf = requestAnimationFrame(loop);

    return () => {
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("keyup", onKeyUp);
      window.clearTimeout(resultTimer);
      window.clearTimeout(winTimer);
      cancelAnimationFrame(raf);
    };
  }, [onWin]);

  return (
    <section className="arcade">
      <canvas
        ref={canvasRef}
        className="arcade__canvas"
        tabIndex={0}
        aria-label="Shootout minigame. Aim with the pointer or arrow keys, hold to charge, release to shoot. Space also charges and shoots."
      />

      <div className="arcade__board">
        <div className="arcade__team">
          <span>DAL ★</span>
          <b>{scored ? 1 : 0}</b>
        </div>
        <div className="arcade__center">
          <small>SHOOTOUT</small>
          <span>SHOTS {shots}</span>
        </div>
        <div className="arcade__team arcade__team--away">
          <b>0</b>
          <span>???</span>
        </div>
      </div>

      <div className={`arcade__message ${scored ? "arcade__message--goal" : ""}`} aria-live="polite">
        {message}
      </div>
      <p className="arcade__hint">AIM · HOLD TO CHARGE · RELEASE · ONE GOAL WINS</p>
    </section>
  );
}
