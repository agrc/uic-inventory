import { useNavigate } from 'react-router-dom';

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button type="button" data-style="alternate" onClick={() => navigate(-1)}>
      Back
    </button>
  );
}
