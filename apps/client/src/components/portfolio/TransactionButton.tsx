import { useState } from "react";
import editIcon from "../../assets/pencil-svgrepo-com.svg";
import { useParams } from "react-router-dom";

export default function TransactionButton({ assetId }: { assetId: string}) {
  const params = useParams<{ id: string }>();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<number | null>(null);

  const handleRemove = (_assetId: string) => {
    setIsEditing(false);
    setInputValue(null);
    // sell transaction here
  };

  if (!isEditing) {
    return (
      <div className="">
        <button onClick={() => setIsEditing(true)}>
        <img
          className="edit-icon"
          src={editIcon}
          alt={isEditing ? "Save icon" : "Edit icon"}
          height={30}
          width={30}
        />
        </button>
      </div>
    );
  }

  return (
    <div className="">
      <input type="number" value={Number(inputValue)} onChange={(e) => setInputValue(Number(e.target.value))} autoFocus />
      <button onClick={() => handleRemove(assetId)}>Remove</button>
    </div>
  )
}
