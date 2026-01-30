import { render, screen } from '@testing-library/react';
import { SummaryCards } from '../components/SummaryCards';

describe('SummaryCards', () => {
  it('renders formatted totals', () => {
    render(<SummaryCards income={1000} expense={250} balance={750} />);
    expect(screen.getByText('R$ 1000.00')).toBeInTheDocument();
    expect(screen.getByText('R$ 250.00')).toBeInTheDocument();
    expect(screen.getByText('R$ 750.00')).toBeInTheDocument();
  });
});
