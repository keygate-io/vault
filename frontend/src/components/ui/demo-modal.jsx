import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogCloseTrigger,
} from "./dialog";
import { AspectRatio } from "@chakra-ui/react";

export function DemoModal({ isOpen: open, onClose }) {
  return (
    <DialogRoot open={open} onOpenChange={({ open }) => !open && onClose()}>
      <DialogContent size="xl" style={{ maxWidth: "90vw", width: "1200px" }}>
        <DialogHeader>
          <DialogTitle fontWeight="semibold">Demo</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>
          <AspectRatio ratio={16 / 9}>
            {/* Replace the src with your actual video URL */}
            <iframe title="Demo Video" src="YOUR_VIDEO_URL" allowFullScreen />
          </AspectRatio>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
