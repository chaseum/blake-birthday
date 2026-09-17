import { birthday } from "../config";

// Deterministic bar widths so the barcode doesn't change between renders.
const BARS = Array.from({ length: 46 }, (_, i) => 1 + ((i * 7 + 3) % 4));

function Barcode() {
  let x = 0;
  return (
    <svg className="ticket__barcode" viewBox="0 0 150 40" preserveAspectRatio="none" aria-hidden="true">
      {BARS.map((w, i) => {
        const bar = i % 2 === 0 ? <rect key={i} x={x} y={0} width={w} height={40} /> : null;
        x += w * 1.05;
        return bar;
      })}
    </svg>
  );
}

function Sticks() {
  return (
    <svg className="ticket__sticks" viewBox="0 0 60 60" aria-hidden="true">
      <path d="M12 4 L40 46 L52 46" />
      <path d="M48 4 L20 46 L8 46" />
      <ellipse cx="30" cy="54" rx="7" ry="3" />
    </svg>
  );
}

function ordinal(day: number) {
  if (day % 100 >= 11 && day % 100 <= 13) return "TH";
  return ["TH", "ST", "ND", "RD"][day % 10] ?? "TH";
}

function Ticket({ seat, index }: { seat: string; index: number }) {
  const [month, day] = birthday.gameDate.split(" ");
  return (
    <article className={`ticket ticket--${index === 0 ? "back" : "front"}`}>
      <div className="ticket__top">
        <div className="ticket__pattern" aria-hidden="true" />
        <span className="ticket__script">you're going to</span>
        <div className="ticket__name">{birthday.birthdayName.toUpperCase()}'S</div>
        <div className="ticket__stripe" aria-hidden="true" />
        <div className="ticket__badge-row">
          <div className="ticket__badge">
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <polygon points="50,3 62,37 98,37 69,59 80,95 50,73 20,95 31,59 2,37 38,37" />
            </svg>
            <span>BDAY</span>
          </div>
          <div className="ticket__event">
            BIRTHDAY
            <small>GAME NIGHT</small>
          </div>
        </div>

        <div className="ticket__emblem" aria-hidden="true">
          <svg viewBox="0 0 100 100">
            <polygon className="ticket__emblem-outer" points="50,2 62,36 99,36 69,58 81,96 50,74 19,96 31,58 1,36 38,36" />
            <polygon className="ticket__emblem-inner" points="50,12 59,40 88,40 64,57 73,86 50,69 27,86 36,57 12,40 41,40" />
          </svg>
          <span>DAL</span>
        </div>

        <div className="ticket__matchup">
          {birthday.opponent.toUpperCase()} <b>AT</b> {birthday.homeTeam.toUpperCase()}
        </div>
      </div>

      <div className="ticket__stub">
        <div className="ticket__when">
          <strong>
            {month} {day}
            <sup>{ordinal(Number(day))}</sup>
          </strong>
          <Sticks />
          <strong>{birthday.gameTime}</strong>
        </div>
        <div className="ticket__access">• ALL ACCESS PASS •</div>
        <div className="ticket__venue">
          <strong>{birthday.venue.toUpperCase()}</strong>
          <span>{birthday.venueAddress[0]}</span>
          <span>{birthday.venueAddress[1]}</span>
        </div>
        <div className="ticket__seats">
          <div><small>GAME</small><b>{birthday.gameDay.slice(0, 3)}</b></div>
          <div><small>SEC</small><b>{birthday.ticket.section}</b></div>
          <div><small>ROW</small><b>{birthday.ticket.row}</b></div>
          <div><small>SEAT</small><b>{seat}</b></div>
        </div>
        <Barcode />
        <div className="ticket__foot">ADMIT ONE · {birthday.gameDate} · SOUVENIR</div>
      </div>
    </article>
  );
}

export function PhysicalTickets() {
  return (
    <div className="ticket-stack">
      {birthday.ticket.seats.map((seat, index) => (
        <Ticket key={index} seat={seat} index={index} />
      ))}
    </div>
  );
}
