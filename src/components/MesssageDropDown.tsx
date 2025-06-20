type MessageDropdownProps = {
  onEdit: () => void;
  onDelete: () => void;
};

export default function MessageDropdown({
  onEdit,
  onDelete,
}: MessageDropdownProps) {
  return (
    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
      <ul className="text-sm text-gray-700">
        <li
          className="block px-4 py-2 hover:bg-gray-100 cursor-pointer transition"
          onClick={onEdit}
        >
          ✏️ Edit
        </li>
        <li
          className="block px-4 py-2 hover:bg-red-100 text-red-600 cursor-pointer transition"
          onClick={onDelete}
        >
          🗑️ Delete
        </li>
      </ul>
    </div>
  );
}
