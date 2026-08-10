import React, { useState } from "react";
import styles from "./StationPortForm.module.css";

const StationPortForm = ({ handleSubmit }) => {
  const [ports, setPorts] = useState([
    {
      portType: "",
      totalPorts: "",
      availablePorts: "",
      price: "",
    },
  ]);

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit(ports);
  };

  const handlePortChange = (index, field, value) => {
    const updated = [...ports];
    updated[index][field] = value;
    setPorts(updated);
  };

  const addNewPort = () => {
    setPorts([
      ...ports,
      {
        portType: "",
        totalPorts: "",
        availablePorts: "",
        price: "",
      },
    ]);
  };

  const removePort = (index) => {
    if (ports.length === 1) return; // prevent removing last port
    const updated = ports.filter((_, i) => i !== index);
    setPorts(updated);
  };

  return (
    <div className={styles.formWrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Port Details</h2>
        <button
          type="button"
          className={styles.addPortBtn}
          onClick={addNewPort}
        >
          ➕ Add Another Port
        </button>
      </div>

      {/* Scrollable Container */}
      <div className={styles.scrollContainer}>
        <form className={styles.form} onSubmit={onSubmit}>
          {ports.map((port, index) => (
            <div key={index} className={styles.portCard}>
              {/* Delete Icon */}
              <button
                type="button"
                className={styles.removePortBtn}
                onClick={() => removePort(index)}
              >
                ❌
              </button>

              {/* Row 1 */}
              <div className={styles.row}>
                <div className={styles.inputBox}>
                  <label>Port Type</label>
                  <input
                    type="text"
                    placeholder="CCS, Type-2, Bharat DC"
                    value={port.portType}
                    onChange={(e) =>
                      handlePortChange(index, "portType", e.target.value)
                    }
                    required
                  />
                </div>

                <div className={styles.inputBox}>
                  <label>Total Ports</label>
                  <input
                    type="number"
                    placeholder="6"
                    value={port.totalPorts}
                    onChange={(e) =>
                      handlePortChange(index, "totalPorts", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className={styles.row}>
                <div className={styles.inputBox}>
                  <label>Available Ports</label>
                  <input
                    type="number"
                    placeholder="4"
                    value={port.availablePorts}
                    onChange={(e) =>
                      handlePortChange(index, "availablePorts", e.target.value)
                    }
                    required
                  />
                </div>

                <div className={styles.inputBox}>
                  <label>Price (₹/kWh)</label>
                  <input
                    type="number"
                    placeholder="20"
                    value={port.price}
                    onChange={(e) =>
                      handlePortChange(index, "price", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <hr className={styles.separator} />
            </div>
          ))}

          <button className={styles.submitBtn}>Continue</button>
        </form>
      </div>
    </div>
  );
};

export default React.memo(StationPortForm);
