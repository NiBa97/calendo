import React from "react";
import { Text, TextProps } from "@chakra-ui/react";

interface TitlePreviewProps extends Omit<TextProps, "children"> {
  title: string;
  lineThrough?: boolean;
}

const TitlePreview: React.FC<TitlePreviewProps> = ({ title, lineThrough = false, ...props }) => {
  return (
    <Text
      color="brand.1"
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
