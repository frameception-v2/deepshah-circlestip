"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useFrameSDK } from "~/hooks/useFrameSDK";

interface TipDetails {
  recipient: string;
  amount: number;
  message?: string;
}

interface TipCardProps {
  onSendTip: (details: TipDetails) => void;
  isLoading: boolean;
  initialValues?: TipDetails;
}

function TipCard({ onSendTip, isLoading, initialValues }: TipCardProps) {
  const [recipient, setRecipient] = useState(initialValues?.recipient || "");
  const [amount, setAmount] = useState(initialValues?.amount?.toString() || "1");
  const [message, setMessage] = useState(initialValues?.message || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendTip({ recipient, amount: parseFloat(amount), message });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Circle Tips</CardTitle>
        <CardDescription>
          Tip your friends with Circles on Farcaster
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient (username or FID)</Label>
            <Input
              id="recipient"
              placeholder="@username or FID"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="flex items-center">
              <Input
                id="amount"
                type="number"
                min="0.1"
                step="0.1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="flex-1"
              />
              <span className="ml-2 text-sm font-medium">Circles</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Input
              id="message"
              placeholder="Thanks for..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || !recipient || !amount} 
          className="w-full"
        >
          {isLoading ? "Processing..." : "Send Tip"}
        </Button>
      </CardFooter>
    </Card>
  );
}

interface SuccessCardProps {
  tipDetails: TipDetails;
  onReset: () => void;
}

function SuccessCard({ tipDetails, onReset }: SuccessCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tip Sent Successfully!</CardTitle>
        <CardDescription>
          Your Circle tip has been processed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <Label className="font-medium">Recipient:</Label>
          <p>{tipDetails.recipient}</p>
        </div>
        <div>
          <Label className="font-medium">Amount:</Label>
          <p>{tipDetails.amount} Circles</p>
        </div>
        {tipDetails.message && (
          <div>
            <Label className="font-medium">Message:</Label>
            <p>{tipDetails.message}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={onReset} className="w-full">Send Another Tip</Button>
      </CardFooter>
    </Card>
  );
}

interface RecentTipsCardProps {
  tips: TipDetails[];
  onTipAgain: (tip: TipDetails) => void;
}

function RecentTipsCard({ tips, onTipAgain }: RecentTipsCardProps) {
  if (!tips || tips.length === 0) return null;
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Recent Tips</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tips.map((tip, index) => (
            <div key={index} className="flex justify-between items-center p-2 border rounded">
              <div>
                <p className="font-medium">{tip.recipient}</p>
                <p className="text-sm text-gray-500">{tip.amount} Circles</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onTipAgain(tip)}>
                Tip Again
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Frame() {
  const { isSDKLoaded } = useFrameSDK();
  const [isLoading, setIsLoading] = useState(false);
  const [tipStatus, setTipStatus] = useState("input"); // input, success
  const [currentTip, setCurrentTip] = useState<TipDetails | null>(null);
  const [recentTips, setRecentTips] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("recentTips");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const handleSendTip = async (tipDetails: TipDetails) => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call an API to process the tip
      // For this prototype, we'll simulate a successful tip after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save to recent tips
      const newTips = [tipDetails, ...recentTips.slice(0, 4)];
      setRecentTips(newTips);
      if (typeof window !== "undefined") {
        localStorage.setItem("recentTips", JSON.stringify(newTips));
      }
      
      setCurrentTip(tipDetails);
      setTipStatus("success");
    } catch (error) {
      console.error("Error sending tip:", error);
      // In a real app, we would handle errors properly here
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTipStatus("input");
    setCurrentTip(null);
  };

  const handleTipAgain = (tip: TipDetails) => {
    setTipStatus("input");
    setCurrentTip(tip);
  };

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-[300px] mx-auto py-2 px-2">
      {tipStatus === "input" ? (
        <TipCard 
          onSendTip={handleSendTip} 
          isLoading={isLoading} 
          initialValues={currentTip}
        />
      ) : (
        <SuccessCard tipDetails={currentTip} onReset={handleReset} />
      )}
      
      {tipStatus === "input" && <RecentTipsCard tips={recentTips} onTipAgain={handleTipAgain} />}
    </div>
  );
}
