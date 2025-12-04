import { useState } from "react";
import {
  FileText,
  Image,
  Music,
  Video,
  Archive,
  Code,
  File,
  Download,
  Trash2,
  Share2,
  Heart,
} from "lucide-react";

function getFileIcon(fileName) {
  const ext = fileName?.split(".").pop()?.toLowerCase() || "";

  if (["pdf", "doc", "docx", "txt"].includes(ext)) return <FileText size={32} className="text-red-500" />;
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return <Image size={32} className="text-purple-500" />;
  if (["mp3", "wav", "flac"].includes(ext)) return <Music size={32} className="text-green-500" />;
  if (["mp4", "avi", "mov", "webm"].includes(ext)) return <Video size={32} className="text-blue-500" />;
  if (["zip", "rar", "7z"].includes(ext)) return <Archive size={32} className="text-yellow-500" />;
  if (["js", "ts", "py", "java", "cpp"].includes(ext)) return <Code size={32} className="text-orange-500" />;

  return <File size={32} className="text-gray-500" />;
}

export default function FileGridView({
  files,
  onDownload,
  onDelete,
  onShare,
  onRename,
  onOpen,
}) {
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [contextMenu, setContextMenu] = useState(null);
  const [hoveredFile, setHoveredFile] = useState(null);

  const toggleSelect = (fileId) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const handleContextMenu = (e, file) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  };

  return (
    <div className="p-6">
      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <FileText size={64} className="mb-4 opacity-30" />
          <p className="text-lg font-medium">No files here</p>
          <p className="text-sm">Drag files here or click to upload</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {files.map((file) => (
            <FileGridItem
              key={file._id}
              file={file}
              isSelected={selectedFiles.has(file._id)}
              isHovered={hoveredFile === file._id}
              onToggleSelect={() => toggleSelect(file._id)}
              onContextMenu={(e) => handleContextMenu(e, file)}
              onMouseEnter={() => setHoveredFile(file._id)}
              onMouseLeave={() => setHoveredFile(null)}
              onDownload={() => onDownload(file)}
              onDelete={() => onDelete(file._id)}
              onShare={() => onShare(file)}
              onRename={() => onRename(file)}
              onOpen={() => onOpen(file)}
            />
          ))}
        </div>
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          file={contextMenu.file}
          onDownload={onDownload}
          onDelete={onDelete}
          onShare={onShare}
          onRename={onRename}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

function FileGridItem({
  file,
  isSelected,
  isHovered,
  onToggleSelect,
  onContextMenu,
  onMouseEnter,
  onMouseLeave,
  onDownload,
  onDelete,
  onShare,
  onOpen,
}) {
  return (
    <div
      onContextMenu={onContextMenu}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`relative p-3 rounded-lg border-2 cursor-pointer transition ${
        isSelected ? "border-blue-500 bg-blue-50" : "border-transparent hover:border-gray-200 bg-gray-50"
      }`}
      onClick={() => onToggleSelect()}
    >
      {/* Checkbox */}
      <div className="absolute top-2 left-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect()}
          className="w-4 h-4 cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* File Icon */}
      <div className="flex justify-center mb-2 cursor-pointer" onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}>
        {getFileIcon(file.fileName)}
      </div>

      {/* File Name */}
      <p className="text-xs font-medium text-gray-900 truncate text-center mb-1" title={file.title}>
        {file.title}
      </p>

      {/* File Size / Author */}
      <p className="text-xs text-gray-500 text-center truncate">{file.author}</p>

      {/* Actions on Hover */}
      {isHovered && (
        <div className="absolute bottom-2 right-2 flex gap-1">
          <ActionButton icon={<Download size={16} />} onClick={(e) => { e.stopPropagation(); onDownload(); }} title="Download" />
          <ActionButton icon={<Share2 size={16} />} onClick={(e) => { e.stopPropagation(); onShare(); }} title="Share" />
          <ActionButton icon={<Trash2 size={16} />} onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Delete" className="text-red-600 hover:bg-red-100" />
        </div>
      )}

      {/* Star on Hover */}
      {isHovered && (
        <div className="absolute top-2 right-2">
          <ActionButton icon={<Heart size={16} />} onClick={(e) => { e.stopPropagation(); }} title="Star" />
        </div>
      )}
    </div>
  );
}

function ActionButton({ icon, onClick, title, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded bg-white hover:bg-gray-100 text-gray-600 shadow transition ${className}`}
      title={title}
    >
      {icon}
    </button>
  );
}

function ContextMenu({ x, y, file, onDownload, onDelete, onShare, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div
        className="fixed z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[200px]"
        style={{ left: `${x}px`, top: `${y}px` }}
      >
        <MenuItem icon={<Download size={16} />} label="Download" onClick={() => { onDownload(file); onClose(); }} />
        <MenuItem icon={<Share2 size={16} />} label="Share" onClick={() => { onShare(file); onClose(); }} />
        <MenuItem icon={<Trash2 size={16} />} label="Delete" onClick={() => { onDelete(file._id); onClose(); }} className="text-red-600" />
      </div>
    </>
  );
}

function MenuItem({ icon, label, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm hover:bg-gray-100 transition ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}
