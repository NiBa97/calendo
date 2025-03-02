import { Accordion, HStack } from "@chakra-ui/react";
import * as React from "react";
import { LuChevronDown } from "react-icons/lu";

interface AccordionItemTriggerProps extends Accordion.ItemTriggerProps {
  indicatorPlacement?: "start" | "end";
}

export const AccordionItemTrigger = React.forwardRef<HTMLButtonElement, AccordionItemTriggerProps>(
  function AccordionItemTrigger(props, ref) {
    const { children, indicatorPlacement = "end", ...rest } = props;
    return (
      <Accordion.ItemTrigger
        {...rest}
        ref={ref}
        color="brand.4"
        bg="brand.2"
        fontWeight="600"
        padding={2}
        boxShadow="md"
        _hover={{ bg: "brand.1" }}
        _focus={{ outline: "none" }}
      >
        {indicatorPlacement === "start" && (
          <Accordion.ItemIndicator rotate={{ base: "-90deg", _open: "0deg" }}>
            <LuChevronDown />
          </Accordion.ItemIndicator>
        )}
        <HStack gap="4" flex="1" textAlign="start" width="full">
          {children}
        </HStack>
        {indicatorPlacement === "end" && (
          <Accordion.ItemIndicator>
            <LuChevronDown />
          </Accordion.ItemIndicator>
        )}
      </Accordion.ItemTrigger>
    );
  }
);

interface AccordionItemContentProps extends Accordion.ItemContentProps {}

export const AccordionItemContent = React.forwardRef<HTMLDivElement, AccordionItemContentProps>(
  function AccordionItemContent(props, ref) {
    return (
      <Accordion.ItemContent>
        <Accordion.ItemBody {...props} ref={ref} />
      </Accordion.ItemContent>
    );
  }
);

export const AccordionRoot = Accordion.Root;
export const AccordionItem = Accordion.Item;
