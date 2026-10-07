// TODO: replace with a Supabase query once prescriptions are wired up, e.g.
// supabase.from('prescriptions').select('*').eq('users_id', userId)

export interface PrescriptionScript {
	id: string;
	name: string;
	frequency: string;
}

export const SAMPLE_PRESCRIPTION_SCRIPTS: PrescriptionScript[] = [
	{ id: 'perindopril', name: 'Perindopril arginine 5 mg', frequency: 'Once daily' },
	{ id: 'candesartan', name: 'Candesartan 16 mg', frequency: 'Once daily' },
	{ id: 'amlodipine', name: 'Amlodipine 5 mg', frequency: 'Once daily' },
	{ id: 'vitamin-d3', name: 'Vitamin D3 1000 IU', frequency: 'Once daily' },
	{ id: 'raloxifene', name: 'Raloxifene 60 mg', frequency: 'Once daily' },
];
