import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AlertPreferences } from '../AlertPreferences';
import { alertAPI, cryptoAPI } from '../../api/client';

// Mock the API client
jest.mock('../../api/client');

const mockAlertAPI = alertAPI as jest.Mocked<typeof alertAPI>;
const mockCryptoAPI = cryptoAPI as jest.Mocked<typeof cryptoAPI>;

describe('AlertPreferences', () => {
  const mockCryptocurrencies = [
    { symbol: 'BTC', name: 'Bitcoin', currentPrice: 50000, change24h: 2.5 },
    { symbol: 'ETH', name: 'Ethereum', currentPrice: 3000, change24h: 1.8 },
    { symbol: 'SOL', name: 'Solana', currentPrice: 100, change24h: -0.5 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockCryptoAPI.getAll.mockResolvedValue({
      data: { cryptocurrencies: mockCryptocurrencies },
    } as any);
  });

  it('should display loading state initially', () => {
    mockAlertAPI.getPreferences.mockReturnValue(new Promise(() => {}));
    mockCryptoAPI.getAll.mockReturnValue(new Promise(() => {}));
    
    render(<AlertPreferences />);
    
    expect(screen.getByText('Alert Preferences')).toBeInTheDocument();
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // Loading spinner
  });

  it('should load and display existing preferences', async () => {
    const mockPreferences = {
      id: 'pref-1',
      userId: 'user-1',
      priceMovementThreshold: 10,
      enablePumpAlerts: true,
      cryptocurrencies: ['BTC', 'ETH'],
      updatedAt: new Date('2024-01-10T10:00:00Z'),
    };

    mockAlertAPI.getPreferences.mockResolvedValue({
      data: { preferences: mockPreferences },
    } as any);

    render(<AlertPreferences />);

    await waitFor(() => {
      expect(screen.getByText('Price Movement Threshold: 10%')).toBeInTheDocument();
    });

    // Verify threshold is set
    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('10');

    // Verify pump alerts toggle is on
    const toggle = screen.getByRole('button', { name: '' });
    expect(toggle).toHaveClass('bg-blue-600');

    // Verify selected cryptocurrencies
    const btcCheckbox = screen.getByLabelText(/BTC/);
    const ethCheckbox = screen.getByLabelText(/ETH/);
    const solCheckbox = screen.getByLabelText(/SOL/);
    
    expect(btcCheckbox).toBeChecked();
    expect(ethCheckbox).toBeChecked();
    expect(solCheckbox).not.toBeChecked();
  });

  it('should allow setting price movement threshold with slider', async () => {
    mockAlertAPI.getPreferences.mockResolvedValue({
      data: { preferences: null },
    } as any);

    render(<AlertPreferences />);

    await waitFor(() => {
      expect(screen.getByText('Price Movement Threshold: 5%')).toBeInTheDocument();
    });

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '15' } });

    expect(screen.getByText('Price Movement Threshold: 15%')).toBeInTheDocument();
  });

  it('should allow toggling pump alerts on/off', async () => {
    mockAlertAPI.getPreferences.mockResolvedValue({
      data: { preferences: null },
    } as any);

    render(<AlertPreferences />);

    await waitFor(() => {
      expect(screen.getByText('Pump Detection Alerts')).toBeInTheDocument();
    });

    const toggle = screen.getByRole('button', { name: '' });
    
    // Initially should be enabled (blue)
    expect(toggle).toHaveClass('bg-blue-600');

    // Click to disable
    fireEvent.click(toggle);
    expect(toggle).toHaveClass('bg-gray-300');

    // Click to enable again
    fireEvent.click(toggle);
    expect(toggle).toHaveClass('bg-blue-600');
  });

  it('should allow selecting cryptocurrencies to monitor with checkboxes', async () => {
    mockAlertAPI.getPreferences.mockResolvedValue({
      data: { preferences: null },
    } as any);

    render(<AlertPreferences />);

    await waitFor(() => {
      expect(screen.getByLabelText(/BTC/)).toBeInTheDocument();
    });

    const btcCheckbox = screen.getByLabelText(/BTC/);
    const ethCheckbox = screen.getByLabelText(/ETH/);

    // Initially unchecked
    expect(btcCheckbox).not.toBeChecked();
    expect(ethCheckbox).not.toBeChecked();

    // Select BTC
    fireEvent.click(btcCheckbox);
    expect(btcCheckbox).toBeChecked();

    // Select ETH
    fireEvent.click(ethCheckbox);
    expect(ethCheckbox).toBeChecked();

    // Deselect BTC
    fireEvent.click(btcCheckbox);
    expect(btcCheckbox).not.toBeChecked();
  });

  it('should save preferences to API when save button is clicked', async () => {
    mockAlertAPI.getPreferences.mockResolvedValue({
      data: { preferences: null },
    } as any);

    const savedPreferences = {
      id: 'pref-1',
      userId: 'user-1',
      priceMovementThreshold: 15,
      enablePumpAlerts: false,
      cryptocurrencies: ['BTC', 'ETH'],
      updatedAt: new Date('2024-01-10T10:00:00Z'),
    };

    mockAlertAPI.updatePreferences.mockResolvedValue({
      data: { preferences: savedPreferences },
    } as any);

    render(<AlertPreferences />);

    await waitFor(() => {
      expect(screen.getByText('Price Movement Threshold: 5%')).toBeInTheDocument();
    });

    // Change threshold
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '15' } });

    // Disable pump alerts
    const toggle = screen.getByRole('button', { name: '' });
    fireEvent.click(toggle);

    // Select cryptocurrencies
    const btcCheckbox = screen.getByLabelText(/BTC/);
    const ethCheckbox = screen.getByLabelText(/ETH/);
    fireEvent.click(btcCheckbox);
    fireEvent.click(ethCheckbox);

    // Click save
    const saveButton = screen.getByText('Save Preferences');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockAlertAPI.updatePreferences).toHaveBeenCalledWith({
        priceMovementThreshold: 15,
        enablePumpAlerts: false,
        cryptocurrencies: ['BTC', 'ETH'],
      });
    });

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText('Preferences saved successfully')).toBeInTheDocument();
    });
  });

  it('should display error message when save fails', async () => {
    mockAlertAPI.getPreferences.mockResolvedValue({
      data: { preferences: null },
    } as any);

    mockAlertAPI.updatePreferences.mockRejectedValue({
      response: {
        data: {
          error: {
            message: 'Failed to save preferences',
          },
        },
      },
    });

    render(<AlertPreferences />);

    await waitFor(() => {
      expect(screen.getByText('Price Movement Threshold: 5%')).toBeInTheDocument();
    });

    // Select a cryptocurrency
    const btcCheckbox = screen.getByLabelText(/BTC/);
    fireEvent.click(btcCheckbox);

    // Click save
    const saveButton = screen.getByText('Save Preferences');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to save preferences')).toBeInTheDocument();
    });
  });

  it('should disable save button when no cryptocurrencies are selected', async () => {
    mockAlertAPI.getPreferences.mockResolvedValue({
      data: { preferences: null },
    } as any);

    render(<AlertPreferences />);

    await waitFor(() => {
      expect(screen.getByText('Save Preferences')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save Preferences');
    expect(saveButton).toBeDisabled();
    expect(saveButton).toHaveClass('cursor-not-allowed');
  });

  it('should enable save button when at least one cryptocurrency is selected', async () => {
    mockAlertAPI.getPreferences.mockResolvedValue({
      data: { preferences: null },
    } as any);

    render(<AlertPreferences />);

    await waitFor(() => {
      expect(screen.getByText('Save Preferences')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save Preferences');
    expect(saveButton).toBeDisabled();

    // Select a cryptocurrency
    const btcCheckbox = screen.getByLabelText(/BTC/);
    fireEvent.click(btcCheckbox);

    expect(saveButton).not.toBeDisabled();
  });

  it('should allow selecting all cryptocurrencies', async () => {
    mockAlertAPI.getPreferences.mockResolvedValue({
      data: { preferences: null },
    } as any);

    render(<AlertPreferences />);

    await waitFor(() => {
      expect(screen.getByText('Select All')).toBeInTheDocument();
    });

    const selectAllButton = screen.getByText('Select All');
    fireEvent.click(selectAllButton);

    const btcCheckbox = screen.getByLabelText(/BTC/);
    const ethCheckbox = screen.getByLabelText(/ETH/);
    const solCheckbox = screen.getByLabelText(/SOL/);

    expect(btcCheckbox).toBeChecked();
    expect(ethCheckbox).toBeChecked();
    expect(solCheckbox).toBeChecked();

    expect(screen.getByText('3 cryptocurrencies selected')).toBeInTheDocument();
  });

  it('should allow deselecting all cryptocurrencies', async () => {
    const mockPreferences = {
      id: 'pref-1',
      userId: 'user-1',
      priceMovementThreshold: 10,
      enablePumpAlerts: true,
      cryptocurrencies: ['BTC', 'ETH', 'SOL'],
      updatedAt: new Date('2024-01-10T10:00:00Z'),
    };

    mockAlertAPI.getPreferences.mockResolvedValue({
      data: { preferences: mockPreferences },
    } as any);

    render(<AlertPreferences />);

    await waitFor(() => {
      expect(screen.getByText('3 cryptocurrencies selected')).toBeInTheDocument();
    });

    const deselectAllButton = screen.getByText('Deselect All');
    fireEvent.click(deselectAllButton);

    const btcCheckbox = screen.getByLabelText(/BTC/);
    const ethCheckbox = screen.getByLabelText(/ETH/);
    const solCheckbox = screen.getByLabelText(/SOL/);

    expect(btcCheckbox).not.toBeChecked();
    expect(ethCheckbox).not.toBeChecked();
    expect(solCheckbox).not.toBeChecked();

    expect(screen.getByText('0 cryptocurrencies selected')).toBeInTheDocument();
  });

  it('should call onSave callback when preferences are saved successfully', async () => {
    mockAlertAPI.getPreferences.mockResolvedValue({
      data: { preferences: null },
    } as any);

    const savedPreferences = {
      id: 'pref-1',
      userId: 'user-1',
      priceMovementThreshold: 10,
      enablePumpAlerts: true,
      cryptocurrencies: ['BTC'],
      updatedAt: new Date('2024-01-10T10:00:00Z'),
    };

    mockAlertAPI.updatePreferences.mockResolvedValue({
      data: { preferences: savedPreferences },
    } as any);

    const onSave = jest.fn();
    render(<AlertPreferences onSave={onSave} />);

    await waitFor(() => {
      expect(screen.getByText('Save Preferences')).toBeInTheDocument();
    });

    // Select a cryptocurrency
    const btcCheckbox = screen.getByLabelText(/BTC/);
    fireEvent.click(btcCheckbox);

    // Click save
    const saveButton = screen.getByText('Save Preferences');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(savedPreferences);
    });
  });

  it('should display error when loading preferences fails', async () => {
    mockCryptoAPI.getAll.mockResolvedValue({
      data: { cryptocurrencies: mockCryptocurrencies },
    } as any);

    mockAlertAPI.getPreferences.mockRejectedValue({
      response: {
        data: {
          error: {
            message: 'Failed to load preferences',
          },
        },
      },
    });

    render(<AlertPreferences />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load preferences')).toBeInTheDocument();
    });
  });
});
