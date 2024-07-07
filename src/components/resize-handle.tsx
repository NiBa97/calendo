import { Box, Flex } from "@chakra-ui/react";
import React from "react";

interface MyHandleComponentProps {
  handleAxis: string;
  innerRef: React.ForwardedRef<HTMLDivElement>;
}

class MyHandleComponent extends React.Component<MyHandleComponentProps> {
  render() {
    const { handleAxis, innerRef, ...props } = this.props;
    return (
      <Box>
        {handleAxis === "e" || handleAxis === "n" ? (
          <Flex
            ref={innerRef}
            className={`react-resizable-handle-${handleAxis}`}
            {...props}
            bg={"brand.2"}
            height={"100%"}
            minWidth={"10px"}
            align={"center"}
            verticalAlign={"center"}
            cursor={"col-resize"}
            position={"absolute"}
            right={"-10px"}
            top={"0px"}
            zIndex={9}
          >
            <Box margin={"auto"} height={"50px"} bg={"brand.3"} minW={"2px"} mx={1} />
          </Flex>
        ) : (
          <Flex
            ref={innerRef}
            className={`react-resizable-handle-${handleAxis}`}
            {...props}
            bg={"brand.2"}
            width={"100%"}
            align={"center"}
            cursor={"row-resize"}
            verticalAlign={"center"}
            position={"absolute"}
            bottom={"-10px"}
            zIndex={9}
            left={"0px"}
          >
            <Box margin={"auto"} width={"50px"} bg={"brand.3"} minH={"2px"} my={1} />
          </Flex>
        )}
      </Box>
    );
  }
}
export const ResizeHandle = React.forwardRef<HTMLDivElement, MyHandleComponentProps>((props, ref) => (
  <MyHandleComponent {...props} innerRef={ref} />
));
