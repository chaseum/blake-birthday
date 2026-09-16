import { useEffect, useRef, useState } from "react";

type Props = {
  onGoal: () => void;
};

type Point = {
  x: number;
  y: number;
};

const PUCK_RADIUS = 13;

export function ShootoutGame({ onGoal }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const [message, setMessage] = useState("Drag the puck backward, then release.");
  const [attempts, setAttempts] = useState(0);
  const hasScoredRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const state = {
      width: 0,
      height: 0,
      puck: { x: 0, y: 0, vx: 0, vy: 0, moving: false },
      drag: { active: false, x: 0, y: 0 },
      goalieX: 0,
      goalieDirection: 1,
      goalieSpeed: 1.7,
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      state.width = rect.width;
      state.height = rect.height;
      resetPuck();
      state.goalieX = rect.width / 2;
    };

    const resetPuck = () => {
      state.puck.x = state.width / 2;
      state.puck.y = state.height * 0.82;
      state.puck.vx = 0;
      state.puck.vy = 0;
      state.puck.moving = false;
      state.drag.active = false;
    };

    const goal = () => {
      if (hasScoredRef.current) return;
      hasScoredRef.current = true;
      state.puck.moving = false;
      setMessage("GOAL.");
      window.setTimeout(onGoal, 850);
    };

    const miss = (copy: string) => {
      state.puck.moving = false;
      setMessage(copy);
      window.setTimeout(() => {
        resetPuck();
        setMessage("Again.");
      }, 650);
    };

    const getNet = () => {
      const width = Math.min(state.width * 0.52, 400);
      const height = width * 0.38;
      return {
        x: (state.width - width) / 2,
        y: state.height * 0.16,
        width,
        height,
      };
    };

    const update = () => {
      const net = getNet();

      const leftBound = net.x + 34;
      const rightBound = net.x + net.width - 34;
      state.goalieX += state.goalieSpeed * state.goalieDirection;

      if (state.goalieX >= rightBound || state.goalieX <= leftBound) {
        state.goalieDirection *= -1;
      }

      if (!state.puck.moving || hasScoredRef.current) return;

      state.puck.x += state.puck.vx;
      state.puck.y += state.puck.vy;
      state.puck.vx *= 0.995;
      state.puck.vy *= 0.995;

      const insideNetX =
        state.puck.x > net.x + 10 && state.puck.x < net.x + net.width - 10;
      const crossedGoalLine =
        state.puck.y > net.y + 8 && state.puck.y < net.y + net.height - 4;

      const goalieWidth = 68;
      const goalieHeight = 70;
      const goalieLeft = state.goalieX - goalieWidth / 2;
      const goalieRight = state.goalieX + goalieWidth / 2;
      const goalieTop = net.y + net.height * 0.36;
      const goalieBottom = goalieTop + goalieHeight;

      const saved =
        state.puck.x > goalieLeft &&
        state.puck.x < goalieRight &&
        state.puck.y > goalieTop &&
        state.puck.y < goalieBottom;

      if (saved) {
        miss("ROBBED.");
        return;
      }

      if (insideNetX && crossedGoalLine) {
        goal();
        return;
      }

      if (
        state.puck.y < -30 ||
        state.puck.x < -30 ||
        state.puck.x > state.width + 30
      ) {
        miss("OFF THE MARK.");
      }
    };

    const draw = () => {
      context.clearRect(0, 0, state.width, state.height);

      const gradient = context.createLinearGradient(0, 0, 0, state.height);
      gradient.addColorStop(0, "#0d1613");
      gradient.addColorStop(1, "#dce7e4");
      context.fillStyle = gradient;
      context.fillRect(0, 0, state.width, state.height);

      // Perspective rink lines.
      context.strokeStyle = "rgba(0, 132, 61, 0.18)";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(state.width * 0.1, state.height);
      context.lineTo(state.width * 0.34, 0);
      context.moveTo(state.width * 0.9, state.height);
      context.lineTo(state.width * 0.66, 0);
      context.stroke();

      const net = getNet();
      context.strokeStyle = "#ffffff";
      context.lineWidth = 5;
      context.strokeRect(net.x, net.y, net.width, net.height);

      context.strokeStyle = "rgba(255,255,255,0.18)";
      context.lineWidth = 1;
      for (let i = 1; i < 8; i += 1) {
        const x = net.x + (net.width / 8) * i;
        context.beginPath();
        context.moveTo(x, net.y);
        context.lineTo(x, net.y + net.height);
        context.stroke();
      }

      // Goalie: intentionally opponent-colored rather than Dallas.
      const goalieY = net.y + net.height * 0.36;
      context.fillStyle = "#6f263d";
      context.fillRect(state.goalieX - 34, goalieY, 68, 70);
      context.fillStyle = "#236192";
      context.fillRect(state.goalieX - 29, goalieY + 8, 58, 12);
      context.fillStyle = "#ffffff";
      context.font = "700 20px system-ui";
      context.textAlign = "center";
      context.fillText("COL", state.goalieX, goalieY + 45);

      if (state.drag.active) {
        context.strokeStyle = "rgba(0,250,0,0.7)";
        context.lineWidth = 3;
        context.setLineDash([8, 8]);
        context.beginPath();
        context.moveTo(state.puck.x, state.puck.y);
        context.lineTo(state.drag.x, state.drag.y);
        context.stroke();
        context.setLineDash([]);
      }

      context.fillStyle = "#060806";
      context.beginPath();
      context.arc(
        state.puck.x,
        state.puck.y,
        PUCK_RADIUS,
        0,
        Math.PI * 2,
      );
      context.fill();

      context.strokeStyle = "#a7a9ac";
      context.lineWidth = 2;
      context.stroke();
    };

    const pointer = (event: PointerEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const onPointerDown = (event: PointerEvent) => {
      if (state.puck.moving || hasScoredRef.current) return;

      const p = pointer(event);
      const distance = Math.hypot(p.x - state.puck.x, p.y - state.puck.y);

      if (distance <= 45) {
        state.drag.active = true;
        state.drag.x = p.x;
        state.drag.y = p.y;
        canvas.setPointerCapture(event.pointerId);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!state.drag.active) return;
      const p = pointer(event);
      state.drag.x = p.x;
      state.drag.y = p.y;
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!state.drag.active) return;

      const p = pointer(event);
      const dx = state.puck.x - p.x;
      const dy = state.puck.y - p.y;
      const strength = Math.min(1.35, Math.hypot(dx, dy) / 120);

      state.drag.active = false;

      if (strength < 0.2) {
        setMessage("Pull farther back.");
        return;
      }

      state.puck.vx = dx * 0.105 * strength;
      state.puck.vy = dy * 0.105 * strength;
      state.puck.moving = true;

      setAttempts((current) => current + 1);
      setMessage("...");
    };

    const loop = () => {
      update();
      draw();
      animationRef.current = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    animationRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [onGoal]);

  return (
    <div className="shootout">
      <div className="shootout__hud">
        <span>OVERTIME</span>
        <span>ATTEMPTS {attempts}</span>
      </div>

      <canvas
        ref={canvasRef}
        className="shootout__canvas"
        aria-label="Hockey shootout game"
      />

      <div className="shootout__message" aria-live="polite">
        {message}
      </div>
    </div>
  );
}
