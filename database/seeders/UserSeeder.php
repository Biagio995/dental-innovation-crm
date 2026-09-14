<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Owner User',
                'email' => env('SEED_OWNER_EMAIL', 'owner@dental.local'),
                'password' => Hash::make(env('SEED_OWNER_PASSWORD', 'ChangeMe!Owner1')),
                'role' => UserRole::Owner,
            ],
            [
                'name' => 'Admin User',
                'email' => env('SEED_ADMIN_EMAIL', 'admin@dental.local'),
                'password' => Hash::make(env('SEED_ADMIN_PASSWORD', 'ChangeMe!Admin1')),
                'role' => UserRole::Admin,
            ],
            [
                'name' => 'Operator User',
                'email' => env('SEED_OPERATOR_EMAIL', 'operator@dental.local'),
                'password' => Hash::make(env('SEED_OPERATOR_PASSWORD', 'ChangeMe!Operator1')),
                'role' => UserRole::Operator,
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }
    }
}
