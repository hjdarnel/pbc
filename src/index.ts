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
            title?: string;
            fields?: [
                {
                    title?: string;
                    value?: string;
                    short?: boolean;
                }
            ];
            author_name?: string;
            author_icon?: string;
            image_url?: string;
        },
        {
            fallback?: string;
            title?: string;
            callback_id?: string;
            color?: string;
            attachment_type?: string;
            actions?: [
                {
                    name?: string;
                    text?: string;
                    type?: string;
                    value?: string;
                },
                {
                    name?: string;
                    text?: string;
                    type?: string;
                    value?: string;
                }
            ];
        }
    ];
}

const respond = async (req: any, res: any) => {
    const body = await qs.parse(await text(req));

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
    const response: IResponse = {
        response_type: 'in_channel',
        text: location + '!!'
    };

    return request.post({
        url: responseUrl,
        headers: {
            'Content-Type': 'application/json'
        },
        body: response,
        json: true
    });
};

export default respond;
