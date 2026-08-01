import { ratings } from "../base";
import styles from "./Rater.module.css";

function background(rating: number): string {
    if (rating % 1 === 0) return ratings[rating][1];
    return `linear-gradient(135deg, ${ratings[rating - 0.5][1]} 0%, ${ratings[rating + 0.5][1]} 100%)`;
}

export default function Rater({ text, rating, setRating }:
    { text: string, rating: number, setRating?: (r: number) => void }) {
    const updateRating = setRating && ((x: number) => {
        let newRating = rating + x;
        const max = ratings.length - 1;
        if (newRating === 0.5) newRating = x > 0 ? 1 : 0;
        else if (newRating > max) newRating = 0;
        else if (newRating < 0) newRating = max;
        setRating(newRating);
    });
    const handleClick = updateRating && ((e: MouseEvent) => {
        e.preventDefault();
        const step = e.shiftKey || e.altKey ? 0.5 : 1;
        updateRating(e.button ? -step : +step);
    });
    return (
        <div class={setRating ? styles.clickable : styles.noclick}
            onClick={handleClick} onContextMenu={handleClick}>
            <button style={{ background: background(rating) }} />
            <span>{text}</span>
        </div>
    );
}
