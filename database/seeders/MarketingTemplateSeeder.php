<?php

namespace Database\Seeders;

use App\Enums\CommunicationChannel;
use App\Models\MessageTemplate;
use Illuminate\Database\Seeder;

class MarketingTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'name' => 'SMS Promemoria 48h',
                'channel' => CommunicationChannel::Sms,
                'subject' => null,
                'body' => 'Gentile {nome}, le ricordiamo il suo appuntamento il {data} alle ore {ora}. Per info: {telefono}. Studio Dentistico.',
                'variables' => ['nome', 'data', 'ora', 'telefono'],
            ],
            [
                'name' => 'SMS Promemoria 24h',
                'channel' => CommunicationChannel::Sms,
                'subject' => null,
                'body' => 'Promemoria: domani {data} alle {ora} ha un appuntamento presso il nostro studio. La aspettiamo! Tel: {telefono}',
                'variables' => ['nome', 'data', 'ora', 'telefono'],
            ],
            [
                'name' => 'SMS Post Visita',
                'channel' => CommunicationChannel::Sms,
                'subject' => null,
                'body' => 'Gentile {nome}, grazie per la sua visita! Il prossimo richiamo è previsto per {data_richiamo}. Per info: {telefono}. A presto!',
                'variables' => ['nome', 'data_richiamo', 'telefono'],
            ],
            [
                'name' => 'Email Promemoria 48h',
                'channel' => CommunicationChannel::Email,
                'subject' => 'Promemoria appuntamento - {data}',
                'body' => "Gentile {nome},\n\nLe ricordiamo che ha un appuntamento presso il nostro studio:\n\n📅 Data: {data}\n⏰ Ora: {ora}\n\nIn caso di impedimenti, La preghiamo di contattarci al numero {telefono} con almeno 24 ore di anticipo.\n\nCordiali saluti,\nStudio Dentistico",
                'variables' => ['nome', 'data', 'ora', 'telefono'],
            ],
            [
                'name' => 'Email Promemoria 24h',
                'channel' => CommunicationChannel::Email,
                'subject' => 'Domani il suo appuntamento - {ora}',
                'body' => "Gentile {nome},\n\nLe ricordiamo che DOMANI {data} alle ore {ora} è previsto il suo appuntamento presso il nostro studio.\n\nLa aspettiamo!\n\nPer informazioni: {telefono}\n\nCordiali saluti,\nStudio Dentistico",
                'variables' => ['nome', 'data', 'ora', 'telefono'],
            ],
            [
                'name' => 'Email Post Visita',
                'channel' => CommunicationChannel::Email,
                'subject' => 'Grazie per la sua visita',
                'body' => "Gentile {nome},\n\nLa ringraziamo per averci fatto visita oggi.\n\nCome concordato, il suo prossimo controllo è previsto per il {data_richiamo}. Sarà nostra cura contattarLa in prossimità della data per fissare l'appuntamento.\n\nPer qualsiasi necessità, non esiti a contattarci al numero {telefono}.\n\nCordiali saluti,\nStudio Dentistico",
                'variables' => ['nome', 'data_richiamo', 'telefono'],
            ],
        ];

        foreach ($templates as $template) {
            MessageTemplate::updateOrCreate(
                ['name' => $template['name'], 'channel' => $template['channel']],
                $template
            );
        }
    }
}
