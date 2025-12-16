type ModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function Modal({ visible, onClose, children }: ModalProps) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "60px",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "90%",
          maxWidth: "520px",
          background: "white",
          padding: "28px",
          borderRadius: "18px",
          boxShadow: "0 8px 30px rgba(15,23,42,0.15)",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          style={{
            float: "right",
            background: "#eee",
            border: "none",
            padding: "6px 12px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
          onClick={onClose}
        >
          ✖
        </button>

        <div style={{ marginTop: "36px" }}>{children}</div>
      </div>
    </div>
  );
}