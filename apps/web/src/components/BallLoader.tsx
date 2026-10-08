import SoccerBall from './SoccerBall';

/** Pelota que rebota y gira mientras carga una página. */
export default function BallLoader({ label }: { label: string }) {
    return (
        <div role="status" className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
            <div className="ball-bounce">
                <SoccerBall className="ball-spin h-12 w-12 drop-shadow" />
            </div>
            <span className="ball-shadow h-1.5 w-10 rounded-full bg-ink/15" aria-hidden="true" />
            <span className="sr-only">{label}</span>
        </div>
    );
}
