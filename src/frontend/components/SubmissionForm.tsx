import { useState } from "react";
import { Card } from "/components/ui/card";
import { Button } from "/components/ui/button";
import { Input } from "/components/ui/input";
import { Textarea } from "/components/ui/textarea";
import { toast } from "sonner";
import { useResults } from "/contexts/ResultsContext";

export const SubmissionForm = () => {
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addResult } = useResults();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !comment || !description) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await addResult({
        email,
        comment,
        description,
      });

      // Clear form
      setEmail("");
      setComment("");
      setDescription("");
      toast.success("Results submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit results. Please try again.");
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Submit Your Results</h3>
          <p className="text-sm text-muted-foreground">
            Share your findings with the community
          </p>
        </div>
        
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          
          <Textarea
            placeholder="Comments about your results..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px]"
          />
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Results"}
          </Button>
        </div>
      </form>
    </Card>
  );
};