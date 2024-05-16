import { useEffect, useState } from "react";
import { Button } from "./button";

type ProbabilityPickerProps = {
  handleProbabilityPicker: (probability: number) => void;
  currentEmployeeProbability: number;
};

export const ProbabilityPicker = ({
  handleProbabilityPicker,
  currentEmployeeProbability,
}: ProbabilityPickerProps) => {
  const [currentProbability, setCurrentProbability] = useState<number>(
    currentEmployeeProbability * 100,
  );

  useEffect(() => {
    setCurrentProbability(currentEmployeeProbability * 100);
  }, [currentEmployeeProbability]);

  const probabilities = [0, 20, 40, 60, 80, 100];

  const handleOnClick = (probability: number) => {
    setCurrentProbability(probability);
    handleProbabilityPicker(probability);
  };

  return (
    <>
      <div className="h-0.5 bg-primary rounded-full" />

      <div>
        <div className="mb-2">
          <p className="font-light">Slaagkans (%)</p>
        </div>
        <div className="flex gap-1">
          {probabilities.map((prob, index) => (
            <Button
              key={index}
              variant={"probabilityPicker"}
              size={"sm"}
              style={{
                backgroundColor:
                  currentProbability === prob ? getButtonColor(prob) : "",
                color: currentProbability === prob ? "#000" : "",
              }}
              onClick={() => handleOnClick(prob)}
            >
              {prob}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
};

const getButtonColor = (probability: number) => {
  if (probability === 0) return "#ff0000";
  if (probability === 20) return "#ff5000";
  if (probability === 40) return "#fea600";
  if (probability === 60) return "#fdc800";
  if (probability === 80) return "#b4fa00";
  if (probability === 100) return "#00ff00";
  return "";
};
