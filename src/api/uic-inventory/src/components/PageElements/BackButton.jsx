import { useHistory } from 'react-router-dom';

export default function BackButton() {
  const history = useHistory();

  return (
    <button type="button" data-meta="default" onClick={() => history.goBack()}>
      Back
    </button>
  );
}
