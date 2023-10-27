import { useState } from "preact/hooks";
import { defaultRatings, kinks } from "../base";
import Rater from "./Rater";

export default function KinkCheck() {
    const [ratings, setRatings] = useState(defaultRatings);
    const setRating = (cat: string, kink: number, pos: number) => (rat: number) => {
        const c = ratings[cat];
        const p = c[kink];
        p[pos] = rat;
        c[kink] = p;
        setRatings({ ...ratings, [cat]: c });
    };
    return <main>
        {
            Object.entries(kinks).map(([cat, kinks]) => (
                <div class="category">
                    <h2>{cat}</h2>
                    <table rules="rows">
                        <tbody>
                            {kinks.map(([kink, positions], i) => (
                                <tr>
                                    <td>{kink}</td>
                                    {positions.map((pos, p) => (
                                        <td>
                                            <Rater text={pos} rating={ratings[cat][i][p]} setRating={setRating(cat, i, p)} />
                                        </td>
                                    ))}
                                    {positions.length === 1 ? (
                                        <td />
                                    ) : undefined}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))
        }
    </main>;
}