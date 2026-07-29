import { ratings } from "../base";
import styles from "./Rater.module.css";

function background(rating: number): string {
    if (rating % 1 === 0) return ratings[rating][1];
    return `linear-gradient(135deg, ${ratings[rating - 0.5][1]} 0%, ${ratings[rating + 0.5][1]} 100%)`;
}

export default function Rater({ text, rating, setRating, clickable }:
    { text: string, rating: number, setRating?: (r: number) => void, clickable: boolean }) {
    const handleClick = !setRating ? undefined : (e: MouseEvent) => {
        e.preventDefault();
        const step = e.shiftKey || e.altKey ? 0.5 : 1;
        let newRating = e.button ? rating - step : rating + step;
        const max = ratings.length - 1;
        if (newRating === 0.5) newRating = e.button ? 0 : 1;
        else if (newRating > max) newRating = 0;
        else if (newRating < 0) newRating = max;
        setRating(newRating);
    };
    return (
        <div class={clickable ? styles.clickable : styles.noclick}
            onClick={handleClick} onContextMenu={handleClick}>
            <button style={{ background: background(rating) }} />
            <span>{text}</span>
        </div>
    );
}
