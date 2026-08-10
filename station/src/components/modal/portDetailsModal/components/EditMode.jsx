import React from "react";
import styles from "../PortDetailsModal.module.css";
import { FaPlus } from "react-icons/fa";
import { callApi } from "../../../../config/axiosConfig";

const EditMode = ({ setEditMode, ports = [], setPorts, getPorts, token }) => {
  /** UPDATE PORT FIELD */
  const updatePort = (index, field, value) => {
    const updated = [...ports];
    updated[index][field] = value;

    // auto calc inUsePorts
    if (field === "totalPorts" || field === "availablePorts") {
      const tot = Number(updated[index].totalPorts);
      const avail = Number(updated[index].availablePorts);
      updated[index].inUsePorts = tot - avail;
    }

    setPorts(updated);
  };

  /** ADD NEW PORT */
  const handleAddNewPort = () => {
    setPorts([
      ...ports,
      {
        portType: "",
        totalPorts: 1,
        availablePorts: 1,
        inUsePorts: 0,
        price: 0,
      },
    ]);
  };

  /** SAVE PORTS */
  const handleUpdateSubmit = async () => {
    const response = await callApi({
      method: "put",
      url: "/station/updatePorts",
      headers: { Authorization: `Bearer ${token}` },
      data: { ports },
    });

    if (response.success) {
      alert("Ports updated successfully!");
      setEditMode(false);
      getPorts();
    }
  };

  return (
    <div className={styles.scrollablePorts}>
      <div className={styles.form}>
        {ports?.map((port, index) => (
          <div key={index} className={styles.sectionBox}>
            <h3 className={styles.sectionTitle}>Port {index + 1}</h3>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Port Type</label>
                <input
                  type="text"
                  value={port.portType}
                  onChange={(e) =>
                    updatePort(index, "portType", e.target.value)
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label>Total Ports</label>
                <input
                  type="number"
                  value={port.totalPorts}
                  onChange={(e) =>
                    updatePort(index, "totalPorts", e.target.value)
                  }
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Available Ports</label>
                <input
                  type="number"
                  value={port.availablePorts}
                  onChange={(e) =>
                    updatePort(index, "availablePorts", e.target.value)
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label>In Use Ports</label>
                <input type="number" value={port.inUsePorts} disabled />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Price (₹)</label>
                <input
                  type="number"
                  value={port.price}
                  onChange={(e) => updatePort(index, "price", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}

        <button
          className={`${styles.primaryBtn} ${styles.addPortBtn} mb-2`}
          onClick={handleAddNewPort}
        >
          <FaPlus style={{ marginRight: 6 }} /> Add New Port
        </button>

        <div className={styles.btnRow}>
          <button className={styles.primaryBtn} onClick={handleUpdateSubmit}>
            Save Changes
          </button>
          <button
            className={styles.cancelBtn}
            onClick={() => setEditMode(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EditMode);
