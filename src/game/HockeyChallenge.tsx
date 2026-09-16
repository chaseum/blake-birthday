import { useEffect, useRef, useState } from "react";
import { birthday } from "../config";
import { playPuckHit, playSaveSound } from "../audio/arenaAudio";

type Props = {
  onWin: () => void;
};

const GOALS_TO_WIN = 2;
const PUCK_RADIUS = 22;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function HockeyChallenge({ onWin }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [shots, setShots] = useState(0);
  const [message, setMessage] = useState("DRAG ANYWHERE · AIM · LET GO");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let goalieX = 0;
    let goalieDirection = 1;
    let resetTimer = 0;
    let winTimer = 0;
    let flashUntil = 0;
    let goals = 0;
    let shotCount = 0;
    let misses = 0;
    let won = false;
    let waiting = false;

    const puck = { x: 0, y: 0, drawX: 0, drawY: 0, scale: 1 };
    // Drag starts wherever the finger lands — no need to hit the puck itself.
    const drag = { active: false, startX: 0, startY: 0, x: 0, y: 0 };
    const shot = {
      active: false,
      startTime: 0,
      duration: 0,
      fromX: 0,
      fromY: 0,
      targetX: 0,
      targetY: 0,
      power: 0,
      goalieTargetX: 0,
    };

    // Each miss makes the goalie smaller and worse at guessing. ponytail: linear
    // assist, tune the multipliers here if it's still too hard/easy.
    const assist = () => Math.min(misses, 5);

    const net = () => {
      const netWidth = Math.min(width * (width < 600 ? 0.86 : 0.66), 620);
      const netHeight = Math.min(height * 0.3, 230);
      return { x: (width - netWidth) / 2, y: height * 0.14, width: netWidth, height: netHeight };
    };

    /** Goalie size/reach scale with the net so phones aren't harder than desktop. */
    const goalieScale = () => net().width / 620;

    /** Pull back like a slingshot, or flick toward the net — both work. */
    const aim = () => {
      const mx = drag.x - drag.startX;
      const my = drag.y - drag.startY;
      const flick = my < -10;
      const vx = flick ? mx : -mx;
      const vy = flick ? -my : my;
      const goal = net();
      const power = clamp((Math.hypot(vx, vy) - 12) / 120, 0, 1);
      const elevation = clamp((vy - 12) / 140, 0, 1);
      return {
        power,
        x: width / 2 + clamp(vx / 120, -1.15, 1.15) * goal.width * 0.46,
        y: goal.y + goal.height * (0.86 - elevation * 0.72),
      };
    };

    const resetPuck = () => {
      puck.x = width / 2;
      puck.y = height * 0.82;
      puck.drawX = puck.x;
      puck.drawY = puck.y;
      puck.scale = 1;
      drag.active = false;
      shot.active = false;
      waiting = false;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      width = rect.width;
      height = rect.height;
      goalieX = width / 2;
      resetPuck();
    };

    const scheduleReset = (copy: string) => {
      misses += 1;
      waiting = true;
      setMessage(copy);
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        resetPuck();
        setMessage(misses >= 3 ? "GOALIE'S GETTING TIRED. SHOOT AGAIN." : "SHOOT AGAIN.");
      }, 900);
    };

    const resolveShot = () => {
      const goal = net();
      const inside =
        shot.targetX > goal.x + 6 &&
        shot.targetX < goal.x + goal.width - 6 &&
        shot.targetY > goal.y + 4 &&
        shot.targetY < goal.y + goal.height;

      if (!inside) {
        playSaveSound("post");
        scheduleReset("PING. OFF THE POST.");
        return;
      }

      const high = shot.targetY < goal.y + goal.height * 0.45;
      const reach = ((high ? 34 : 50) - assist() * 5) * goalieScale();
      if (Math.abs(shot.targetX - goalieX) < reach) {
        playSaveSound("save");
        scheduleReset(high ? "GLOVE SAVE. GO THE OTHER WAY." : "SAVE. AIM FOR A CORNER.");
        return;
      }

      goals += 1;
      waiting = true;
      setScore(goals);
      flashUntil = performance.now() + 500;

      if (goals >= GOALS_TO_WIN) {
        won = true;
        setMessage("GAME WINNER!");
        winTimer = window.setTimeout(onWin, 1100);
        return;
      }

      setMessage("GOAL! ONE MORE.");
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        resetPuck();
        setMessage("ONE MORE FOR THE WIN.");
      }, 1100);
    };

    const fire = () => {
      const { power, x, y } = aim();
      drag.active = false;
      if (power < 0.1) {
        setMessage("DRAG A LITTLE FURTHER.");
        return;
      }

      const guessError = (Math.random() - 0.5) * (120 + assist() * 50);
      const goal = net();
      shot.active = true;
      shot.startTime = performance.now();
      shot.duration = 620 - power * 200;
      shot.fromX = puck.x;
      shot.fromY = puck.y;
      shot.targetX = x;
      shot.targetY = y;
      shot.power = power;
      shot.goalieTargetX = clamp(x + guessError, goal.x + 40, goal.x + goal.width - 40);

      shotCount += 1;
      setShots(shotCount);
      setMessage("SHOT AWAY...");
      playPuckHit(power);
    };

    const pointerPosition = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const onPointerDown = (event: PointerEvent) => {
      if (shot.active || won || waiting) return;
      const point = pointerPosition(event);
      drag.active = true;
      drag.startX = drag.x = point.x;
      drag.startY = drag.y = point.y;
      canvas.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!drag.active) return;
      const point = pointerPosition(event);
      drag.x = point.x;
      drag.y = point.y;
    };

    const onPointerUp = () => {
      if (drag.active) fire();
    };

    const drawRink = () => {
      const goal = net();

      const ice = ctx.createLinearGradient(0, 0, 0, height);
      ice.addColorStop(0, "#cfe3e4");
      ice.addColorStop(0.5, "#eef6f6");
      ice.addColorStop(1, "#d6e8e8");
      ctx.fillStyle = ice;
      ctx.fillRect(0, 0, width, height);

      // Boards + glass at the top edge.
      ctx.fillStyle = "#0b1a12";
      ctx.fillRect(0, 0, width, goal.y * 0.55);
      ctx.fillStyle = "#00843d";
      ctx.fillRect(0, goal.y * 0.55, width, 6);
      ctx.fillStyle = "#f4f7f6";
      ctx.fillRect(0, goal.y * 0.55 + 6, width, goal.y * 0.12);

      // Goal line + crease.
      ctx.strokeStyle = "rgba(200, 30, 50, .7)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, goal.y + goal.height);
      ctx.lineTo(width, goal.y + goal.height);
      ctx.stroke();

      ctx.fillStyle = "rgba(70, 150, 215, .38)";
      ctx.beginPath();
      ctx.ellipse(width / 2, goal.y + goal.height, goal.width * 0.3, goal.height * 0.55, 0, 0, Math.PI);
      ctx.fill();

      // Faceoff circles.
      ctx.strokeStyle = "rgba(200, 30, 50, .35)";
      ctx.lineWidth = 3;
      [0.18, 0.82].forEach((fx) => {
        ctx.beginPath();
        ctx.ellipse(width * fx, height * 0.72, width * 0.13, height * 0.1, 0, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Net: back fill, mesh, red frame.
      ctx.fillStyle = "rgba(255, 255, 255, .55)";
      ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
      ctx.strokeStyle = "rgba(90, 110, 118, .4)";
      ctx.lineWidth = 1;
      for (let i = 1; i < 14; i += 1) {
        const x = goal.x + (goal.width / 14) * i;
        ctx.beginPath();
        ctx.moveTo(x, goal.y);
        ctx.lineTo(x, goal.y + goal.height);
        ctx.stroke();
      }
      for (let i = 1; i < 7; i += 1) {
        const y = goal.y + (goal.height / 7) * i;
        ctx.beginPath();
        ctx.moveTo(goal.x, y);
        ctx.lineTo(goal.x + goal.width, y);
        ctx.stroke();
      }
      ctx.strokeStyle = "#d0142c";
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(goal.x, goal.y + goal.height);
      ctx.lineTo(goal.x, goal.y);
      ctx.lineTo(goal.x + goal.width, goal.y);
      ctx.lineTo(goal.x + goal.width, goal.y + goal.height);
      ctx.stroke();

      return goal;
    };

    const drawGoalie = (goal: ReturnType<typeof net>) => {
      const shrink = (1 - assist() * 0.06) * Math.max(goalieScale(), 0.6);
      const top = goal.y + goal.height * 0.3;
      const bodyW = 70 * shrink;
      const bodyH = goal.height * 0.5;

      ctx.save();
      ctx.translate(goalieX, top);

      ctx.fillStyle = "rgba(0,0,0,.18)";
      ctx.beginPath();
      ctx.ellipse(0, goal.height * 0.72, bodyW, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pads
      ctx.fillStyle = "#f2f5f5";
      ctx.fillRect(-bodyW * 0.62, bodyH - 6, bodyW * 0.46, goal.height * 0.36);
      ctx.fillRect(bodyW * 0.16, bodyH - 6, bodyW * 0.46, goal.height * 0.36);
      ctx.fillStyle = "#6f263d";
      ctx.fillRect(-bodyW * 0.62, bodyH + 10, bodyW * 0.46, 6);
      ctx.fillRect(bodyW * 0.16, bodyH + 10, bodyW * 0.46, 6);

      // Jersey
      ctx.fillStyle = "#6f263d";
      ctx.fillRect(-bodyW / 2, 0, bodyW, bodyH);
      ctx.fillStyle = "#236192";
      ctx.fillRect(-bodyW / 2, bodyH * 0.2, bodyW, bodyH * 0.14);
      ctx.fillStyle = "#fff";
      ctx.font = `800 ${Math.round(16 * shrink)}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText("COL", 0, bodyH * 0.7);

      // Mask
      ctx.fillStyle = "#1b2a31";
      ctx.beginPath();
      ctx.arc(0, -14 * shrink, 20 * shrink, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#e7eeee";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Glove + blocker
      ctx.fillStyle = "#8a2f4b";
      ctx.beginPath();
      ctx.arc(bodyW * 0.75, bodyH * 0.25, 13 * shrink, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e7eeee";
      ctx.fillRect(-bodyW * 0.95, bodyH * 0.2, 16 * shrink, 22 * shrink);

      ctx.restore();
    };

    const drawAim = () => {
      if (!drag.active) return;
      const { power, x, y } = aim();
      const ready = power >= 0.1;
      const color = ready ? "0, 132, 61" : "190, 50, 50";

      // Rubber band from the touch point.
      ctx.strokeStyle = "rgba(0, 0, 0, .25)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(drag.startX, drag.startY);
      ctx.lineTo(drag.x, drag.y);
      ctx.stroke();

      ctx.strokeStyle = `rgba(${color}, ${0.45 + power * 0.5})`;
      ctx.lineWidth = 4;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      ctx.moveTo(puck.x, puck.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = `rgb(${color})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.moveTo(x - 30, y);
      ctx.lineTo(x + 30, y);
      ctx.moveTo(x, y - 30);
      ctx.lineTo(x, y + 30);
      ctx.stroke();

      const barW = Math.min(360, width - 60);
      ctx.fillStyle = "rgba(0,0,0,.55)";
      ctx.fillRect((width - barW) / 2, height - 34, barW, 12);
      ctx.fillStyle = `rgb(${color})`;
      ctx.fillRect((width - barW) / 2, height - 34, barW * power, 12);
    };

    const drawPuck = () => {
      const r = PUCK_RADIUS * puck.scale;
      if (!shot.active && !waiting) {
        // Idle pulse so it's obvious where the shot comes from.
        const pulse = 1 + Math.sin(performance.now() / 260) * 0.12;
        ctx.strokeStyle = "rgba(0, 132, 61, .45)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(puck.drawX, puck.drawY, r * 2 * pulse, r * 0.9 * pulse, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(0,0,0,.2)";
      ctx.beginPath();
      ctx.ellipse(puck.drawX + 3, puck.drawY + r * 0.35, r, r * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0b0c0c";
      ctx.fillRect(puck.drawX - r, puck.drawY - r * 0.35, r * 2, r * 0.35);
      ctx.beginPath();
      ctx.ellipse(puck.drawX, puck.drawY, r, r * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1e2222";
      ctx.beginPath();
      ctx.ellipse(puck.drawX, puck.drawY - r * 0.35, r, r * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    const update = (now: number) => {
      const goal = net();
      if (!shot.active) {
        const speed = (1.3 - assist() * 0.15) * goalieScale();
        goalieX += speed * goalieDirection;
        const margin = 70 * goalieScale();
        if (goalieX > goal.x + goal.width - margin) goalieDirection = -1;
        if (goalieX < goal.x + margin) goalieDirection = 1;
        return;
      }

      const progress = clamp((now - shot.startTime) / shot.duration, 0, 1);
      const eased = easeOutCubic(progress);
      puck.drawX = shot.fromX + (shot.targetX - shot.fromX) * eased;
      puck.drawY =
        shot.fromY + (shot.targetY - shot.fromY) * eased - Math.sin(progress * Math.PI) * 30 * shot.power;
      puck.scale = 1 - progress * 0.55;

      if (progress > 0.4) {
        goalieX += (shot.goalieTargetX - goalieX) * (0.07 - assist() * 0.008);
      }

      if (progress >= 1) {
        shot.active = false;
        puck.x = puck.drawX;
        puck.y = puck.drawY;
        resolveShot();
      }
    };

    const loop = (now: number) => {
      update(now);
      const goal = drawRink();
      const puckBehindGoalie = shot.active || puck.y < height / 2;
      if (puckBehindGoalie) drawPuck();
      drawGoalie(goal);
      if (!puckBehindGoalie) drawPuck();
      drawAim();
      if (now < flashUntil) {
        ctx.fillStyle = `rgba(0, 200, 90, ${0.25 + Math.sin(now / 30) * 0.12})`;
        ctx.fillRect(0, 0, width, height);
      }
      animationFrame = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    animationFrame = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      window.clearTimeout(resetTimer);
      window.clearTimeout(winTimer);
      cancelAnimationFrame(animationFrame);
    };
  }, [onWin]);

  return (
    <section className="hockey-game">
      <canvas ref={canvasRef} className="hockey-game__canvas" />

      <div className="hockey-game__bug">
        <div className="hockey-game__brand">
          <span>FINAL CHALLENGE</span>
          <strong>{birthday.birthdayName.toUpperCase()} SHOOTOUT</strong>
        </div>
        <div className="hockey-game__stat">
          <span>GOALS</span>
          <strong>
            {score}/{GOALS_TO_WIN}
          </strong>
        </div>
        <div className="hockey-game__stat">
          <span>SHOTS</span>
          <strong>{shots}</strong>
        </div>
      </div>

      <div className="hockey-game__message" aria-live="polite">
        {message}
      </div>
      <p className="hockey-game__hint">
        Press anywhere and pull back (or flick up). Sideways picks the corner, further = higher.
      </p>
    </section>
  );
}
