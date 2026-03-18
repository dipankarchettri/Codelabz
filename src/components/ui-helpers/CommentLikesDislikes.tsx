import React, { useState, useEffect } from "react";
import { ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { ThumbUp, ThumbDown } from "@mui/icons-material";
import firebase from "../../config/index";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Union type for the like/dislike selection state.
 * `null` means the user has not voted yet.
 */
type Choice = "like" | "dislike" | null;

/**
 * Props accepted by the CommentLikesDislikes component.
 */
interface CommentLikesDislikesProps {
  /** Firestore document ID of the comment being voted on. */
  comment_id: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const CommentLikesDislikes: React.FC<CommentLikesDislikesProps> = ({
  comment_id
}) => {
  const [userChoice, setUserChoice] = useState<Choice>(null);
  const [upVotes, setUpVotes] = useState<number>(0);
  const [downVotes, setDownVotes] = useState<number>(0);

  const db = firebase.firestore();

  useEffect(() => {
    const userId: string | undefined = firebase.auth().currentUser?.uid;

    if (!userId) {
      // User not authenticated — nothing to subscribe to.
      return;
    }

    const commentDocRef = db.collection("cl_comments").doc(comment_id);
    const userChoiceRef = db
      .collection("comment_likes")
      .doc(`${comment_id}_${userId}`);

    /**
     * Fetches the current user's vote state and subscribes to real-time
     * like/dislike count updates on this comment.
     *
     * @returns A cleanup function that unsubscribes from all listeners.
     */
    const fetchData = async (): Promise<(() => void) | undefined> => {
      try {
        const commentDoc = await commentDocRef.get();
        if (!commentDoc.exists) {
          throw new Error("Comment not found");
        }

        // Restore the user's existing vote (if any).
        const userChoiceDoc = await userChoiceRef.get();
        if (userChoiceDoc.exists) {
          const existingChoice = userChoiceDoc.data()?.value as number;
          setUserChoice(existingChoice === 1 ? "like" : "dislike");
        } else {
          setUserChoice(null);
        }

        // Subscribe to real-time like count.
        const unsubscribeLikes = db
          .collection("comment_likes")
          .where("comment_id", "==", comment_id)
          .where("value", "==", 1)
          .onSnapshot(snapshot => {
            setUpVotes(snapshot.size);
            commentDocRef.update({ upVotes: snapshot.size });
          });

        // Subscribe to real-time dislike count.
        const unsubscribeDislikes = db
          .collection("comment_likes")
          .where("comment_id", "==", comment_id)
          .where("value", "==", -1)
          .onSnapshot(snapshot => {
            setDownVotes(snapshot.size);
            commentDocRef.update({ downVotes: snapshot.size });
          });

        return () => {
          unsubscribeLikes();
          unsubscribeDislikes();
        };
      } catch (error: unknown) {
        console.error("Error fetching comment data:", error);
        return undefined;
      }
    };

    let cleanup: (() => void) | undefined;
    fetchData().then(cleanupFn => {
      cleanup = cleanupFn;
    });

    return () => {
      cleanup?.();
    };
  }, [comment_id, db]);

  /**
   * Handles the user toggling a like or dislike.
   * Writes the vote to Firestore, or removes it if the user un-toggles.
   */
  const handleUserChoice = async (
    _event: React.MouseEvent<HTMLElement>,
    newChoice: Choice
  ): Promise<void> => {
    if (userChoice === newChoice) return;

    const userId: string | undefined = firebase.auth().currentUser?.uid;
    if (!userId) return;

    try {
      const voteRef = db
        .collection("comment_likes")
        .doc(`${comment_id}_${userId}`);

      if (newChoice !== null) {
        const value: number = newChoice === "like" ? 1 : -1;
        await voteRef.set(
          { uid: userId, comment_id, value },
          { merge: true }
        );
      } else {
        await voteRef.delete();
      }

      setUserChoice(newChoice);
    } catch (error: unknown) {
      console.error("Error setting user choice:", error);
    }
  };

  return (
    <ToggleButtonGroup
      size="small"
      value={userChoice}
      exclusive
      onChange={handleUserChoice}
      aria-label="like dislike"
    >
      <ToggleButton value="like" aria-label="like">
        <ThumbUp />
        <Typography variant="body2">{upVotes}</Typography>
      </ToggleButton>
      <ToggleButton value="dislike" aria-label="dislike">
        <ThumbDown />
        <Typography variant="body2">{downVotes}</Typography>
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default CommentLikesDislikes;
