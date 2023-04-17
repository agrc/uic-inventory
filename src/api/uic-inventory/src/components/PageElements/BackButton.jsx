import { useNavigate } from 'react-router-dom';

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button type="button" data-meta="default" onClick={() => navigate(-1)}>
      Back
    </button>
  );
}
