import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import DriveSidebar from "../components/DriveSidebar/DriveSidebar";
import FileGridView from "../components/FileGridView/FileGridView";
import FileListView from "../components/FileListView/FileListView";
import UploadArea from "../components/UploadArea/UploadArea";
import Loader from "../components/ui/Loader";
import { getMyBooks, deleteBook, updateBook} from "../lib/queries";
import { useAuth } from "../components/auth-context";

export default function DriveDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading] = useState(false);
  const [viewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFolder, setCurrentFolder] = useState("my-drive");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    if (!user) {
      navigate("/");
    } else {
      fetchFiles();
    }
  }, [user, navigate]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const books = await getMyBooks();
      setFiles(books);
    } catch (error) {
      toast.error("Failed to load files");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (newFile) => {
    setFiles((prev) => [newFile, ...prev]);
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      await deleteBook(fileId);
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
      toast.success("File deleted successfully");
    } catch (error) {
      toast.error("Failed to delete file");
      console.error(error);
    }
  };

  const handleRename = async (file) => {
    const newName = prompt("Enter new name:", file.title);
    if (!newName || newName === file.title) return;

    try {
      const formData = new FormData();
      formData.append("title", newName);
      formData.append("author", file.author);
      formData.append("description", file.description);

      const updated = await updateBook(file._id, formData);
      setFiles((prev) =>
        prev.map((f) => (f._id === file._id ? updated : f))
      );
      toast.success("File renamed successfully");
    } catch (error) {
      toast.error("Failed to rename file");
      console.error(error);
    }
  };

  const handleDownload = (file) => {
    if (file.fileUrl) {
      window.open(file.fileUrl, "_blank");
    }
  };

  const handleShare = (file) => {
    toast.info(`Share dialog for ${file.title} (coming soon)`);
  };

  const handleOpen = (file) => {
    if (file.fileUrl) {
      window.open(file.fileUrl, "_blank");
    }
  };

  const filteredFiles = files.filter(
    (file) =>
      file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <DriveSidebar
        currentFolder={currentFolder}
        onFolderClick={setCurrentFolder}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">
                {currentFolder === "my-drive"
                  ? "My Drive"
                  : currentFolder === "recent"
                  ? "Recent"
                  : currentFolder === "starred"
                  ? "Starred"
                  : "Trash"}
              </h2>
              <p className="text-sm text-gray-500">
                {filteredFiles.length} items
              </p>
            </div>
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 px-4 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <UploadArea onFileUpload={handleFileUpload} isUploading={isUploading} />
          </div>
        </div>

        {/* File View */}
        <div className="flex-1 overflow-auto bg-gray-50">
          {viewMode === "grid" ? (
            <FileGridView
              files={filteredFiles}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onShare={handleShare}
              onRename={handleRename}
              onOpen={handleOpen}
            />
          ) : (
            <FileListView
              files={filteredFiles}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onShare={handleShare}
              onRename={handleRename}
              onOpen={handleOpen}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={(by) => {
                if (sortBy === by) {
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                } else {
                  setSortBy(by);
                  setSortOrder("asc");
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
