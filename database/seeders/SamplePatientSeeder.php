<?php

namespace Database\Seeders;

use App\Enums\AppointmentStatus;
use App\Enums\PatientStatus;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Visit;
use Illuminate\Database\Seeder;

class SamplePatientSeeder extends Seeder
{
    public function run(): void
    {
        $patient1 = Patient::updateOrCreate(
            ['email' => 'mario.rossi@example.com'],
            [
                'first_name' => 'Mario',
                'last_name' => 'Rossi',
                'phone' => '+39 333 1234567',
                'date_of_birth' => '1985-03-15',
                'notes' => 'Regular patient, no allergies.',
                'consents' => [
                    'marketing' => true,
                    'data_processing' => true,
                    'medical_records' => true,
                ],
                'status' => PatientStatus::Active,
            ]
        );

        $patient2 = Patient::updateOrCreate(
            ['email' => 'giulia.verdi@example.com'],
            [
                'first_name' => 'Giulia',
                'last_name' => 'Verdi',
                'phone' => '+39 340 9876543',
                'date_of_birth' => '1992-07-22',
                'notes' => 'Sensitive teeth, prefers morning appointments.',
                'consents' => [
                    'marketing' => false,
                    'data_processing' => true,
                    'medical_records' => true,
                ],
                'status' => PatientStatus::Active,
            ]
        );

        $appointment1 = Appointment::updateOrCreate(
            [
                'patient_id' => $patient1->id,
                'scheduled_at' => now()->addDays(3)->setTime(10, 0),
            ],
            [
                'duration_minutes' => 30,
                'type' => 'checkup',
                'notes' => 'Regular 6-month checkup',
                'status' => AppointmentStatus::Confirmed,
            ]
        );

        $appointment2 = Appointment::updateOrCreate(
            [
                'patient_id' => $patient2->id,
                'scheduled_at' => now()->addDays(7)->setTime(9, 0),
            ],
            [
                'duration_minutes' => 45,
                'type' => 'cleaning',
                'notes' => 'Deep cleaning requested',
                'status' => AppointmentStatus::Scheduled,
            ]
        );

        $pastAppointment = Appointment::updateOrCreate(
            [
                'patient_id' => $patient1->id,
                'scheduled_at' => now()->subDays(30)->setTime(14, 30),
            ],
            [
                'duration_minutes' => 60,
                'type' => 'filling',
                'notes' => 'Cavity treatment - completed',
                'status' => AppointmentStatus::Completed,
            ]
        );

        Visit::updateOrCreate(
            ['appointment_id' => $pastAppointment->id],
            [
                'patient_id' => $patient1->id,
                'treatment_notes' => 'Composite filling on molar #36. Patient tolerated procedure well.',
                'recommended_recall_date' => now()->addMonths(6)->toDateString(),
            ]
        );

        $this->command->info('Sample patients and appointments seeded successfully.');
    }
}
