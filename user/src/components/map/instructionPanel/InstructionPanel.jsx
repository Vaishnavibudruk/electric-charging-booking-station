import React from "react";
import styles from "./InstructionPanel.module.css";
import { FaArrowRight, FaArrowLeft, FaLongArrowAltUp } from "react-icons/fa";
import { IoMdWalk } from "react-icons/io";
import { MdStraight } from "react-icons/md";

const getDirectionIcon = (instruction) => {
  const lower = instruction.toLowerCase();
  if (lower.includes("left")) return <FaArrowLeft className={styles.icon} />;
  if (lower.includes("right")) return <FaArrowRight className={styles.icon} />;
  if (lower.includes("straight")) return <MdStraight className={styles.icon} />;
  if (lower.includes("walk")) return <IoMdWalk className={styles.icon} />;
  return <FaLongArrowAltUp className={styles.icon} />;
};

const InstructionPanel = ({ routeInstructions = [] }) => {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Navigation Instructions</h3>
      {routeInstructions.length === 0 ? (
        <p>No route selected</p>
      ) : (
        <div className={styles.instructionList}>
          {routeInstructions?.map((step, i) => (
            <div key={i} className={styles.instructionItem}>
              <div className={styles.instructionNumber}>{i + 1}</div>
              {getDirectionIcon(step.instruction)}
              <div className={styles.instructionText}>{step.instruction}</div>
              <div className={styles.distance}>
                {step.distance.toFixed(0)} m
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(InstructionPanel);
