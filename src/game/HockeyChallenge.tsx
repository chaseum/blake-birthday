import { useEffect, useRef, useState } from "react";
import { birthday } from "../config";
import { playPuckHit, playSaveSound } from "../audio/arenaAudio";

type Props = {
  onWin: () => void;
};

type Shot = {
  active: boolean;
  startTime: number;
  duration: number;
  fromX: number;
  fromY: number;
  targetX: number;
  targetY: number;
  power: number;
  goalieTargetX: number;
};

type Drag = {
  active: boolean;
  x: number;
  y: number;
};

const GOALS_TO_WIN = 2;
const PUCK_RADIUS = 14;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function HockeyChallenge({ onWin }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const winCalled = useRef(false);
  const scoreRef = useRef(0);
  const shotsRef = useRef(0);
  const [score, setScore] = useState(0);
  const [shots, setShots] = useState(0);
  const [message, setMessage] = useState("DRAG THE PUCK BACK · PICK A CORNER · RELEASE");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let goalieX = 0;
    let goalieVelocity = 1.65;
    let goalieDirection = 1;
    let resetTimer = 0;
    let flashUntil = 0;

    const puck = {
      x: 0,
      y: 0,
      drawX: 0,
      drawY: 0,
      scale: 1,
    };

    const drag: Drag = {
      active: false,
      x: 0,
      y: 0,
    };

    const shot: Shot = {
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

    const net = () => {
      const netWidth = Math.min(width * 0.56, 520);
      const netHeight = Math.min(height * 0.24, 170);
      return {
        x: (width - netWidth) / 2,
        y: height * 0.12,
        width: netWidth,
        height: netHeight,
      };
    };

    const resetPuck = () => {
      puck.x = width / 2;
      puck.y = height * 0.84;
      puck.drawX = puck.x;
      puck.drawY = puck.y;
      puck.scale = 1;
      drag.active = false;
      shot.active = false;
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
      window.clearTimeout(resetTimer);
      setMessage(copy);
      resetTimer = window.setTimeout(() => {
        resetPuck();
        setMessage("AGAIN.");
      }, 900);
    };

    const resolveShot = () => {
      const goal = net();
      const insideX =
        shot.targetX > goal.x + 13 &&
        shot.targetX < goal.x + goal.width - 13;
      const insideY =
        shot.targetY > goal.y + 12 &&
        shot.targetY < goal.y + goal.height - 8;

      if (!insideX || !insideY) {
        playSaveSound("post");
        scheduleReset("OFF THE MARK.");
        return;
      }

      const postMargin = 24;
      const clippedPost =
        shot.targetX < goal.x + postMargin ||
        shot.targetX > goal.x + goal.width - postMargin ||
        shot.targetY < goal.y + 18;

      if (clippedPost && Math.random() < 0.46) {
        playSaveSound("post");
        scheduleReset("PING. OFF THE POST.");
        return;
      }

      const goalieWidth = Math.max(66, 102 - Math.min(shotsRef.current, 6) * 4);
      const goalieTop = goal.y + goal.height * 0.34;
      const goalieBottom = goal.y + goal.height + 24;
      const goalieCoversX = Math.abs(shot.targetX - goalieX) < goalieWidth * 0.56;
      const lowEnoughToSave = shot.targetY > goalieTop - 12 && shot.targetY < goalieBottom;
      const gloveReach =
        Math.abs(shot.targetX - goalieX) < goalieWidth * 0.82 &&
        shot.targetY > goalieTop - 42 &&
        shot.targetY < goalieTop + 18;

      if ((goalieCoversX && lowEnoughToSave) || gloveReach) {
        playSaveSound("save");
        scheduleReset("ROBBED.");
        return;
      }

      const nextScore = scoreRef.current + 1;
      scoreRef.current = nextScore;
      setScore(nextScore);
      flashUntil = performance.now() + 420;
      setMessage(nextScore >= GOALS_TO_WIN ? "GAME WINNER." : "GOAL. ONE MORE.");

      if (nextScore >= GOALS_TO_WIN) {
        if (!winCalled.current) {
          winCalled.current = true;
          window.setTimeout(onWin, 1050);
        }
        return;
      }

      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        resetPuck();
        setMessage("ONE MORE GOAL.");
      }, 1050);
    };

    const fire = (releaseX: number, releaseY: number) => {
      const dx = puck.x - releaseX;
      const dy = puck.y - releaseY;
      const dragDistance = Math.hypot(dx, dy);
      const power = clamp((dragDistance - 28) / 155, 0, 1);

      if (power < 0.18) {
        drag.active = false;
        setMessage("PULL FARTHER BACK.");
        return;
      }

      const goal = net();
      const horizontalAim = clamp(dx / 145, -1.2, 1.2);
      const verticalAim = clamp((-dy - 20) / 165, -0.15, 1);
      const targetX = width / 2 + horizontalAim * goal.width * 0.46;
      const targetY =
        goal.y + goal.height * (0.82 - clamp(verticalAim, 0, 1) * 0.67);

      const missPenalty = Math.max(22, 72 - shotsRef.current * 7);
      const predictionError = (Math.random() - 0.5) * missPenalty * 2;
      const goalieTargetX = clamp(
        targetX + predictionError,
        goal.x + 42,
        goal.x + goal.width - 42,
      );

      shot.active = true;
      shot.startTime = performance.now();
      shot.duration = 690 - power * 210;
      shot.fromX = puck.x;
      shot.fromY = puck.y;
      shot.targetX = targetX;
      shot.targetY = targetY;
      shot.power = power;
      shot.goalieTargetX = goalieTargetX;
      drag.active = false;

      shotsRef.current += 1;
      setShots(shotsRef.current);
      setMessage("SHOT AWAY...");
      playPuckHit(power);
    };

    const pointerPosition = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const onPointerDown = (event: PointerEvent) => {
      if (shot.active || winCalled.current) return;
      const point = pointerPosition(event);
      if (Math.hypot(point.x - puck.x, point.y - puck.y) > 48) return;
      drag.active = true;
      drag.x = point.x;
      drag.y = point.y;
      canvas.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!drag.active) return;
      const point = pointerPosition(event);
      drag.x = point.x;
      drag.y = clamp(point.y, puck.y - 35, height - 18);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!drag.active) return;
      const point = pointerPosition(event);
      fire(point.x, clamp(point.y, puck.y - 35, height - 18));
    };

    const drawRink = () => {
      const goal = net();

      const iceGradient = ctx.createLinearGradient(0, 0, 0, height);
      iceGradient.addColorStop(0, "#d7e8e8");
      iceGradient.addColorStop(0.45, "#edf5f4");
      iceGradient.addColorStop(1, "#c7dddd");
      ctx.fillStyle = iceGradient;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "rgba(0, 60, 110, .08)";
      ctx.beginPath();
      ctx.ellipse(width / 2, height * 0.58, width * 0.2, height * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(198, 24, 48, .52)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width * 0.08, height * 0.53);
      ctx.lineTo(width * 0.92, height * 0.53);
      ctx.stroke();

      ctx.strokeStyle = "rgba(30, 93, 149, .42)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width * 0.18, height);
      ctx.lineTo(goal.x + 34, goal.y + goal.height);
      ctx.moveTo(width * 0.82, height);
      ctx.lineTo(goal.x + goal.width - 34, goal.y + goal.height);
      ctx.stroke();

      const creaseGradient = ctx.createRadialGradient(
        width / 2,
        goal.y + goal.height,
        8,
        width / 2,
        goal.y + goal.height,
        goal.width * 0.28,
      );
      creaseGradient.addColorStop(0, "rgba(76, 156, 211, .34)");
      creaseGradient.addColorStop(1, "rgba(76, 156, 211, .04)");
      ctx.fillStyle = creaseGradient;
      ctx.beginPath();
      ctx.ellipse(
        width / 2,
        goal.y + goal.height,
        goal.width * 0.27,
        goal.height * 0.7,
        0,
        Math.PI,
        Math.PI * 2,
      );
      ctx.fill();

      ctx.strokeStyle = "#c92336";
      ctx.lineWidth = 7;
      ctx.strokeRect(goal.x, goal.y, goal.width, goal.height);

      ctx.strokeStyle = "rgba(92, 121, 129, .36)";
      ctx.lineWidth = 1;
      for (let i = 1; i < 10; i += 1) {
        const x = goal.x + (goal.width / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, goal.y + 4);
        ctx.lineTo(x, goal.y + goal.height - 3);
        ctx.stroke();
      }
      for (let i = 1; i < 5; i += 1) {
        const y = goal.y + (goal.height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(goal.x + 4, y);
        ctx.lineTo(goal.x + goal.width - 4, y);
        ctx.stroke();
      }

      return goal;
    };

    const drawGoalie = (goal: ReturnType<typeof net>) => {
      const y = goal.y + goal.height * 0.39;
      const bodyWidth = 78;
      const bodyHeight = 82;

      ctx.save();
      ctx.translate(goalieX, y);

      ctx.fillStyle = "#6f263d";
      ctx.fillRect(-bodyWidth / 2, 0, bodyWidth, bodyHeight);

      ctx.fillStyle = "#236192";
      ctx.fillRect(-bodyWidth / 2 + 5, 12, bodyWidth - 10, 14);

      ctx.fillStyle = "#ffffff";
      ctx.font = "800 17px Arial";
      ctx.textAlign = "center";
      ctx.fillText("COL", 0, 53);

      ctx.fillStyle = "#eef3f3";
      ctx.fillRect(-54, bodyHeight - 8, 31, 62);
      ctx.fillRect(23, bodyHeight - 8, 31, 62);

      ctx.fillStyle = "#17232a";
      ctx.beginPath();
      ctx.arc(0, -11, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#eef3f3";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.strokeStyle = "#6f263d";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(36, 26);
      ctx.lineTo(76, 2);
      ctx.stroke();

      ctx.strokeStyle = "#554731";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-34, 55);
      ctx.lineTo(-88, 110);
      ctx.stroke();

      ctx.restore();
    };

    const drawPuck = () => {
      if (drag.active) {
        const dx = puck.x - drag.x;
        const dy = puck.y - drag.y;
        const dragDistance = Math.hypot(dx, dy);
        const power = clamp((dragDistance - 28) / 155, 0, 1);
        const goal = net();
        const horizontalAim = clamp(dx / 145, -1.2, 1.2);
        const verticalAim = clamp((-dy - 20) / 165, -0.15, 1);
        const targetX = width / 2 + horizontalAim * goal.width * 0.46;
        const targetY = goal.y + goal.height * (0.82 - clamp(verticalAim, 0, 1) * 0.67);

        ctx.strokeStyle = `rgba(0, 132, 61, ${0.35 + power * 0.55})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([9, 10]);
        ctx.beginPath();
        ctx.moveTo(puck.x, puck.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = power > 0.35 ? "#00843d" : "#b93b3b";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 17, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(targetX - 24, targetY);
        ctx.lineTo(targetX + 24, targetY);
        ctx.moveTo(targetX, targetY - 24);
        ctx.lineTo(targetX, targetY + 24);
        ctx.stroke();

        ctx.fillStyle = "rgba(0,0,0,.7)";
        ctx.fillRect(24, height - 28, width - 48, 9);
        ctx.fillStyle = power > 0.35 ? "#00843d" : "#bd3535";
        ctx.fillRect(24, height - 28, (width - 48) * power, 9);
      }

      const radius = PUCK_RADIUS * puck.scale;
      const gradient = ctx.createRadialGradient(
        puck.drawX - radius * 0.3,
        puck.drawY - radius * 0.3,
        2,
        puck.drawX,
        puck.drawY,
        radius,
      );
      gradient.addColorStop(0, "#333");
      gradient.addColorStop(1, "#040504");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(puck.drawX, puck.drawY, radius, radius * 0.46, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#616161";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    const update = (now: number) => {
      const goal = net();

      if (!shot.active) {
        goalieX += goalieVelocity * goalieDirection;
        if (goalieX > goal.x + goal.width - 58) goalieDirection = -1;
        if (goalieX < goal.x + 58) goalieDirection = 1;
      } else {
        const progress = clamp((now - shot.startTime) / shot.duration, 0, 1);
        const eased = easeOutCubic(progress);
        puck.drawX = shot.fromX + (shot.targetX - shot.fromX) * eased;
        const linearY = shot.fromY + (shot.targetY - shot.fromY) * eased;
        puck.drawY = linearY - Math.sin(progress * Math.PI) * 22 * shot.power;
        puck.scale = 1 - progress * 0.56;

        const reactionStart = 0.34 + (1 - shot.power) * 0.13;
        if (progress > reactionStart) {
          const reactionProgress = clamp((progress - reactionStart) / (1 - reactionStart), 0, 1);
          goalieX += (shot.goalieTargetX - goalieX) * (0.08 + reactionProgress * 0.08);
        }

        if (progress >= 1) {
          shot.active = false;
          puck.x = puck.drawX;
          puck.y = puck.drawY;
          resolveShot();
        }
      }
    };

    const draw = (now: number) => {
      const goal = drawRink();
      drawGoalie(goal);
      drawPuck();

      if (now < flashUntil) {
        ctx.fillStyle = `rgba(0, 250, 0, ${0.22 + Math.sin(now / 28) * 0.12})`;
        ctx.fillRect(0, 0, width, height);
      }
    };

    const loop = (now: number) => {
      update(now);
      draw(now);
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
      cancelAnimationFrame(animationFrame);
    };
  }, [onWin]);

  return (
    <section className="hockey-game">
      <div className="hockey-game__broadcast">
        <div className="hockey-game__brand">
          <span>FINAL CHALLENGE</span>
          <strong>{birthday.birthdayName.toUpperCase()} SHOOTOUT</strong>
        </div>
        <div className="hockey-game__score">
          <span>GOALS</span>
          <strong>{score}/{GOALS_TO_WIN}</strong>
        </div>
        <div className="hockey-game__shots">
          <span>SHOTS</span>
          <strong>{shots}</strong>
        </div>
      </div>

      <div className="hockey-game__frame">
        <canvas ref={canvasRef} className="hockey-game__canvas" />
        <div className="hockey-game__glass" aria-hidden="true" />
      </div>

      <div className="hockey-game__message" aria-live="polite">{message}</div>
      <p className="hockey-game__hint">
        Pull down and sideways from the puck. More pull = more power and elevation.
        Top corners are harder for the goalie to reach.
      </p>
    </section>
  );
}
