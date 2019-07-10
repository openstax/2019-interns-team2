import { React, PropTypes, styled } from '../../../helpers/react';
import { Button } from 'react-bootstrap';


const StyledBtn = styled(Button).attrs({ size: 'lg' })`
  align-self: flex-end;
  margin: 4rem;
`;

export default function ContinueBtn({ ux: { canGoForward, goForward }, ...props }) {
  if (!canGoForward) { return null; }

  return (
    <StyledBtn
      variant="primary"
      {...props}
      className="continue"
      onClick={goForward}
    >
      Continue
    </StyledBtn>
  );
}


ContinueBtn.propTypes = {
  ux: PropTypes.shape({
    canGoForward: PropTypes.bool.isRequired,
    goForward: PropTypes.func.isRequired,
  }).isRequired,
};
