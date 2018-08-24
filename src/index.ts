import * as request from 'request-promise-native';
import * as qs from 'query-string';
import { text, send } from 'micro';

import { createLogger } from 'bunyan';
const logger = createLogger({
    name: 'beers',
    level: 'info'
});

interface IRequest {
    token: string;
    command: string;
    text: string;
    response_url: string;
    trigger_id: string;
    user_id: string;
    user_name: string;
    team_id: string;
    channel_id: string;
}

interface IResponse {
    text?: string;
    response_type: string;
    attachments?: [
        {
            fallback: string;
            color?: string;
            pretext?: string;
            author_name?: string;
            author_link?: string;
            author_icon?: string;
            title: string;
            title_link: string;
            text?: string;
            fields?: [
                {
                    title: string;
                    value: string;
                    short: boolean;
                }
            ];
            image_url?: string;
            thumb_url?: string;
            footer?: string;
            footer_icon?: string;
            ts: number;
        }
    ];
}

const respond = async (req: any, res: any) => {
    const body: IRequest = await qs.parse(await text(req));

    logger.debug(body);

    const location = body.text;
    const responseUrl = body.response_url;

    if (!responseUrl) {
        send(res, 400);
    } else if (!location || !(location === 'uptown' || location === 'downtown')) {
        return 'No proper location!';
    } else {
        send(res, 200, {
            response_type: 'in_channel',
            text: 'Getting beers from Untappd for ...'
        });

        try {
            await getBeers(location, responseUrl);
        } catch (e) {
            logger.warn('Error gettings beers', e);
        }
    }
};

const getBeers = async (location: string, responseUrl: string): Promise<request.RequestPromise> => {
    // TODO: Get beers from location

    // TODO: Format into a nice list
    const response: IResponse = {
        response_type: 'in_channel',
        text: location + '!!'
    };

    return request.post({
        url: responseUrl,
        headers: { 'Content-Type': 'application/json' },
        body: response,
        json: true
    });
};

export default respond;
