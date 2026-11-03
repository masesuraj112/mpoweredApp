import { fireEvent, render, screen } from '@testing-library/react-native';

import type { SupportedPatient } from '@/features/support-person/types';

import { InitialsAvatar } from './InitialsAvatar';
import { NotificationBell } from './NotificationBell';
import { PermissionChips } from './PermissionChips';
import { PillButton } from './PillButton';
import { SectionLabel } from './SectionLabel';
import { StatusBadge } from './StatusBadge';
import { SupportRequestCard } from './SupportRequestCard';
import { SupportedPatientCard } from './SupportedPatientCard';

describe('NotificationBell', () => {
  it('names the count for screen readers and opens the requests', async () => {
    const onPress = jest.fn();
    await render(<NotificationBell count={3} onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Support person requests, 3 new' }));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('shows 9+ for a long list and no badge for none', async () => {
    const { rerender } = await render(<NotificationBell count={12} onPress={jest.fn()} />);
    expect(screen.getByText('9+')).toBeTruthy();

    await rerender(<NotificationBell count={0} onPress={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Support person requests' })).toBeTruthy();
    expect(screen.queryByText('0')).toBeNull();
  });

  it('is only an indicator, not a button, without a handler', async () => {
    await render(<NotificationBell count={2} />);

    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByLabelText('Support person requests, 2 new')).toBeTruthy();
  });
});

describe('SupportRequestCard', () => {
  it('accepts and rejects, naming the patient', async () => {
    const onAccept = jest.fn();
    const onReject = jest.fn();
    await render(<SupportRequestCard patientName="Jane Cooper" onAccept={onAccept} onReject={onReject} />);

    expect(screen.getByText('Jane Cooper has added you as a support person')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Accept request from Jane Cooper' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Reject request from Jane Cooper' }));

    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(onReject).toHaveBeenCalledTimes(1);
  });
});

describe('PillButton', () => {
  it('presses with its label as the spoken name', async () => {
    const onPress = jest.fn();
    await render(<PillButton label="View more appointments" size="large" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'View more appointments' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('small display components', () => {
  it('shows the right status badge', async () => {
    const { rerender } = await render(<StatusBadge hasUpcoming />);
    expect(screen.getByText('Appointment upcoming')).toBeTruthy();

    await rerender(<StatusBadge hasUpcoming={false} />);
    expect(screen.getByText('No scheduled appointments')).toBeTruthy();
  });

  it('says which permissions are allowed', async () => {
    await render(<PermissionChips canAddQuestions canAddAnswers={false} />);

    expect(screen.getByLabelText('Add Questions: allowed')).toBeTruthy();
    expect(screen.getByLabelText("Add Doctor's Answer: not allowed")).toBeTruthy();
  });

  it('shows a section label as an uppercase heading', async () => {
    await render(<SectionLabel>Upcoming appointment</SectionLabel>);

    expect(screen.getByRole('header', { name: 'UPCOMING APPOINTMENT' })).toBeTruthy();
  });

  it('shows initials and hides them from screen readers', async () => {
    await render(<InitialsAvatar name="Jane Cooper" />);

    expect(screen.getByText('JC', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByText('JC')).toBeNull();
  });
});

describe('SupportedPatientCard', () => {
  const patient = {
    id: 'p1',
    name: 'Jane Cooper',
    condition: 'Osteoarthritis',
    canAddQuestions: true,
    canAddAnswers: false,
    appointments: [],
  } as unknown as SupportedPatient;

  it('shows who they support, the condition and no upcoming appointment', async () => {
    const onViewAppointments = jest.fn();
    await render(
      <SupportedPatientCard patient={patient} onAddQuestions={jest.fn()} onViewAppointments={onViewAppointments} />,
    );

    expect(screen.getByText('Jane Cooper')).toBeTruthy();
    expect(screen.getByText('Osteoarthritis')).toBeTruthy();
    expect(screen.getByText('No scheduled appointments')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'View more appointments' }));
    expect(onViewAppointments).toHaveBeenCalledTimes(1);
  });

  it('leaves out the condition when there is none', async () => {
    await render(
      <SupportedPatientCard
        patient={{ ...patient, condition: '' } as SupportedPatient}
        onAddQuestions={jest.fn()}
        onViewAppointments={jest.fn()}
      />,
    );

    expect(screen.queryByText('Osteoarthritis')).toBeNull();
  });
});
