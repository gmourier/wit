import { useParams } from "react-router-dom";
import ThreadDisplay from "../components/threadDisplay";

export default function Thread() {
    let params = useParams();

    return (
        <>
            <ThreadDisplay tweetId={params.id}/>
        </>
    )
}