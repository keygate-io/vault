import { Box } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

const Feature = ({ children, name, required = true }) => {
  const config = useSelector((state) => state.config);
  const isEnabled = required ? config[name].enabled : true;

  return isEnabled ? <Box data-feature={name}>{children}</Box> : null;
};

Feature.propTypes = {
  children: PropTypes.node.isRequired,
  name: PropTypes.string.isRequired,
  required: PropTypes.bool,
};

export { Feature };
