import { birthday } from "../config";

function Ticket({ seat, index }: { seat: string; index: number }) {
  return (
    <article className={`physical-ticket physical-ticket--${index === 0 ? "left" : "right"}`}>
      <div className="physical-ticket__pattern" aria-hidden="true" />
      <header className="physical-ticket__header">
        <span className="physical-ticket__invite">YOU'RE GOING TO</span>
        <div className="physical-ticket__team">DALLAS ★ STARS</div>
        <span className="physical-ticket__birthday">BLAKE'S BIRTHDAY GAME</span>
      </header>

      <div className="physical-ticket__matchup">
        <span>{birthday.opponent.toUpperCase()}</span>
        <strong>AT</strong>
        <span>{birthday.homeTeam.toUpperCase()}</span>
      </div>

      <div className="physical-ticket__date-band">
        <div>
          <small>{birthday.gameDay}</small>
          <strong>{birthday.gameDate}</strong>
        </div>
        <div className="physical-ticket__sticks" aria-hidden="true">╲╱</div>
        <div>
          <small>PUCK DROP</small>
          <strong>{birthday.gameTime}</strong>
        </div>
      </div>

      <div className="physical-ticket__venue">{birthday.venue}</div>

      <div className="physical-ticket__seat-grid">
        <div><small>SEC</small><strong>{birthday.ticket.section}</strong></div>
        <div><small>ROW</small><strong>{birthday.ticket.row}</strong></div>
        <div><small>SEAT</small><strong>{seat}</strong></div>
      </div>

      <div className="physical-ticket__barcode" aria-hidden="true" />
      <footer>
        <span>BDAY-{birthday.birthdayName.toUpperCase()}-012227-{index + 1}</span>
        <span>SOUVENIR · NOT VALID FOR ENTRY</span>
      </footer>
    </article>
  );
}

export function PhysicalTickets() {
  return (
    <div className="ticket-stack">
      {birthday.ticket.seats.map((seat, index) => (
        <Ticket key={`${seat}-${index}`} seat={seat} index={index} />
      ))}
    </div>
  );
}
