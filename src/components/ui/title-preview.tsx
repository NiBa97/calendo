import React from "react";
import { Text, TextProps } from "@chakra-ui/react";

interface TitlePreviewProps extends Omit<TextProps, "children"> {
  title: string;
  lineThrough?: boolean;
  contrast?: "dark" | "bright";
}

const TitlePreview: React.FC<TitlePreviewProps> = ({ title, lineThrough = false, contrast = "dark", ...props }) => {
  return (
    <Text
      color={contrast === "dark" ? "gray.800" : "gray.200"}
      fontSize="lg"
      fontWeight="bold"
      textDecoration={lineThrough ? "line-through" : "none"}
      {...props}
    >
      {title}
    </Text>
  );
};

export default TitlePreview;
