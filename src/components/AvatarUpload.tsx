import { useState, useRef } from "react";
import { Camera } from "lucide-react";

interface AvatarUploadProps {
  initials: string;
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

const sizeClasses = {
  sm: "h-12 w-12 text-sm",
  md: "h-20 w-20 text-2xl",
  lg: "h-24 w-24 text-3xl",
};

const cameraSizes = {
  sm: "h-5 w-5 -bottom-0.5 -right-0.5",
  md: "h-7 w-7 -bottom-0.5 -right-0.5",
  lg: "h-8 w-8 bottom-0 right-0",
};

const AvatarUpload = ({ initials, size = "md", icon }: AvatarUploadProps) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => inputRef.current?.click()}
        className={`relative flex items-center justify-center rounded-full overflow-hidden gradient-primary font-bold text-primary-foreground ${sizeClasses[size]}`}
      >
        {photo ? (
          <img src={photo} alt="Avatar" className="h-full w-full object-cover" />
        ) : icon ? (
          icon
        ) : (
          initials
        )}
      </button>
      <button
        onClick={() => inputRef.current?.click()}
        className={`absolute flex items-center justify-center rounded-full bg-primary border-2 border-background text-primary-foreground ${cameraSizes[size]}`}
      >
        <Camera className="h-3 w-3" />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
};

export default AvatarUpload;
