// Type definitions for node-telegram-bot-api
// Project: https://github.com/yagop/node-telegram-bot-api
// Definitions by: Oliver Verver <https://github.com/oliver3>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module 'telegram-api-types' {

    interface User {
        id: number // Unique identifier for this user or bot
        first_name: string // User‘s or bot’s first name
        last_name?: string // Optional. User‘s or bot’s last name
        username?: string // Optional. User‘s or bot’s username
    }

    interface Chat {
        id: number // Unique identifier for this chat. This number may be greater than 32 bits and some programming languages may have difficulty/silent defects in interpreting it. But it smaller than 52 bits, so a signed 64 bit integer or double-precision float type are safe for storing this identifier.
        type: 'private'|'group'|'supergroup'|'channel' // Type of chat
        title?: string // Title, for supergroups, channels and group chats
        username?: string // Username, for private chats, supergroups and channels if available
        first_name?: string // First name of the other party in a private chat
        last_name?: string // Last name of the other party in a private chat
        all_members_are_administrators: boolean // True if a group has ‘All Members Are Admins’ enabled.
    }

    type MessageEntity = {
        // Type of the entity. Can be mention (@username), hashtag, bot_command, url, email, bold (bold text),
        // italic (italic text), code (monowidth string), pre (monowidth block)
        type: 'mention'|'hashtag'|'bot_command'|'url'|'email'|'bold'|'italic'|'code'|'pre'
        offset: number // Offset in UTF-16 code units to the start of the entity
        length: number // Length of the entity in UTF-16 code units
    } & {
        // text_link (for clickable text URLs),
        type: 'text_link'
        url: string // For “text_link” only, url that will be opened after user taps on the text

    } & {
        // text_mention (for users without usernames)
        type: 'text_mention'
        user: User // For “text_mention” only, the mentioned user
    }

    interface Message {
        message_id: number, // Unique message identifier inside this chat
        from?: User // Sender, can be empty for messages sent to channels
        date?: number // Date the message was sent in Unix time
        chat: Chat // Conversation the message belongs to
        forward_from?: User // For forwarded messages, sender of the original message
        forward_from_chat?: Chat // For messages forwarded from a channel, information about the original channel
        forward_from_message_id?: number // For forwarded channel posts, identifier of the original message in the channel
        forward_date?: number // For forwarded messages, date the original message was sent in Unix time
        reply_to_message?: Message // For replies, the original message. Note that the Message object in this field will not contain further reply_to_message fields even if it itself is a reply.
        edit_date?: number // Date the message was last edited in Unix time
        text?: string // For text messages, the actual UTF-8 text of the message, 0-4096 characters.
        entities?: MessageEntity[] // For text messages, special entities like usernames, URLs, bot commands, etc. that appear in the text

        // TODO
        // audio	Audio	Optional. Message is an audio file, information about the file
        // document	Document	Optional. Message is a general file, information about the file
        // game	Game	Optional. Message is a game, information about the game. More about games »
        // photo	Array of PhotoSize	Optional. Message is a photo, available sizes of the photo
        // sticker	Sticker	Optional. Message is a sticker, information about the sticker
        // video	Video	Optional. Message is a video, information about the video
        // voice	Voice	Optional. Message is a voice message, information about the file
        // caption	String	Optional. Caption for the document, photo or video, 0-200 characters
        // contact	Contact	Optional. Message is a shared contact, information about the contact
        // location	Location	Optional. Message is a shared location, information about the location
        // venue	Venue	Optional. Message is a venue, information about the venue

        // new_chat_member	User	Optional. A new member was added to the group, information about them (this member may be the bot itself)
        // left_chat_member	User	Optional. A member was removed from the group, information about them (this member may be the bot itself)
        // new_chat_title	String	Optional. A chat title was changed to this value
        // new_chat_photo	Array of PhotoSize	Optional. A chat photo was change to this value
        // delete_chat_photo	True	Optional. Service message: the chat photo was deleted
        // group_chat_created	True	Optional. Service message: the group has been created
        // supergroup_chat_created	True	Optional. Service message: the supergroup has been created. This field can‘t be received in a message coming through updates, because bot can’t be a member of a supergroup when it is created. It can only be found in reply_to_message if someone replies to a very first message in a directly created supergroup.
        // channel_chat_created	True	Optional. Service message: the channel has been created. This field can‘t be received in a message coming through updates, because bot can’t be a member of a channel when it is created. It can only be found in reply_to_message if someone replies to a very first message in a channel.
        // migrate_to_chat_id	Integer	Optional. The group has been migrated to a supergroup with the specified identifier. This number may be greater than 32 bits and some programming languages may have difficulty/silent defects in interpreting it. But it smaller than 52 bits, so a signed 64 bit integer or double-precision float type are safe for storing this identifier.
        // migrate_from_chat_id	Integer	Optional. The supergroup has been migrated from a group with the specified identifier. This number may be greater than 32 bits and some programming languages may have difficulty/silent defects in interpreting it. But it smaller than 52 bits, so a signed 64 bit integer or double-precision float type are safe for storing this identifier.
        // pinned_message	Message	Optional. Specified message was pinned. Note that the Message object in this field will not contain further reply_to_message fields even if it is itself a reply.
    }

    // TODO https://core.telegram.org/bots/api#inlinequeryresult
    type InlineQueryResult = any;

}

declare module 'node-telegram-bot-api' {
    import { Stream } from 'stream';
    import * as Promise from 'bluebird';
    import { User, InlineQueryResult, Message } from "telegram-api-types";

    interface TelegramBotOptions {
        polling?: boolean | TelegramBotPollingOptions,
        webHook?: boolean | TelegramBotWebHookOptions,
        onlyFirstMatch?: boolean,
        request?: Object
    }

    interface TelegramBotPollingOptions {
        timeout?: number,
        interval?: number
    }

    interface TelegramBotWebHookOptions {
        key?: string,
        cert?: string
    }

    type MessageType = 'text'|'audio'|'document'|'photo'|'sticker'|'video'|'voice'|'contact'
        |'location'|'new_chat_participant'|'left_chat_participant'|'new_chat_title'
        |'new_chat_photo'|'delete_chat_photo'|'group_chat_created'

    type Action = 'typing'|'upload_photo'|'record_video'|'upload_video'|'record_audio'|'upload_audio'|'upload_document'|'find_location';

    type ChatId = number|string;
    type MessageId = number|string;



    class TelegramBot {
        /**
         * Both request method to obtain messages are implemented. To use standard polling, set `polling: true`
         * on `options`. Notice that [webHook](https://core.telegram.org/bots/api#setwebhook) will need a SSL certificate.
         * Emits `message` when a message arrives.
         *
         * @class TelegramBot
         * @constructor
         * @param {String} token Bot Token
         * @param {Object} [options]
         * @param {Boolean|Object} [options.polling=false] Set true to enable polling or set options
         * @param {String|Number} [options.polling.timeout=10] Polling time in seconds
         * @param {String|Number} [options.polling.interval=2000] Interval between requests in miliseconds
         * @param {Boolean|Object} [options.webHook=false] Set true to enable WebHook or set options
         * @param {String} [options.webHook.key] PEM private key to webHook server.
         * @param {String} [options.webHook.cert] PEM certificate (public) to webHook server.
         * @param {Boolean} [options.onlyFirstMatch=false] Set to true to stop after first match. Otherwise, all regexps are executed
         * @param {Object} [options.request] Options which will be added for all requests to telegram api.
         *  See https://github.com/request/request#requestoptions-callback for more information.
         * @see https://core.telegram.org/bots/api
         */
        constructor(token: string, options?: TelegramBotOptions)

        stopPolling(): Promise<any>

        /**
         * Returns basic information about the bot in form of a `User` object.
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#getme
         */
        getMe(): Promise<User>

        /**
         * Specify an url to receive incoming updates via an outgoing webHook.
         * @param {String} url URL where Telegram will make HTTP Post. Leave empty to
         * delete webHook.
         * @param {String|stream.Stream} [cert] PEM certificate key (public).
         * @see https://core.telegram.org/bots/api#setwebhook
         */
        setWebHook(url: string, cert?: string|Stream): Promise<any>

        /**
         * Send text message.
         * @param  {Number|String} chatId Unique identifier for the message recipient
         * @param  {String} text Text of the message to be sent
         * @param  {Object} [options] Additional Telegram query options
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#sendmessage
         */
        sendMessage(chatId: ChatId, text: string, options?: Object): Promise<any>

        /**
         * Send answers to an inline query.
         * @param  {String} inlineQueryId Unique identifier of the query
         * @param  {InlineQueryResult[]} results An array of results for the inline query
         * @param  {Object} [options] Additional Telegram query options
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#answerinlinequery
         */
        answerInlineQuery(inlineQueryId: string, results: InlineQueryResult[], options?: Object): Promise<any>

        /**
         * Forward messages of any kind.
         * @param  {Number|String} chatId     Unique identifier for the message recipient
         * @param  {Number|String} fromChatId Unique identifier for the chat where the
         * original message was sent
         * @param  {Number|String} messageId  Unique message identifier
         * @return {Promise}
         */
        forwardMessage(chatId: ChatId, fromChatId: ChatId, messageId: MessageId): Promise<any>

        /**
         * Send photo
         * @param  {Number|String} chatId  Unique identifier for the message recipient
         * @param  {String|Stream|Buffer} photo A file path or a Stream. Can
         * also be a `file_id` previously uploaded
         * @param  {Object} [options] Additional Telegram query options
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#sendphoto
         */
        sendPhoto(chatId: ChatId, photo: string|Stream|Buffer, options?: Object): Promise<any>

        /**
         * Send audio
         * @param  {Number|String} chatId  Unique identifier for the message recipient
         * @param  {String|Stream|Buffer} audio A file path, Stream or Buffer.
         * Can also be a `file_id` previously uploaded.
         * @param  {Object} [options] Additional Telegram query options
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#sendaudio
         */
        sendAudio(chatId: ChatId, audio: string|Stream|Buffer, options?: Object): Promise<any>

        /**
         * Send Document
         * @param  {Number|String} chatId  Unique identifier for the message recipient
         * @param  {String|Stream|Buffer} doc A file path, Stream or Buffer.
         * Can also be a `file_id` previously uploaded.
         * @param  {Object} [options] Additional Telegram query options
         * @param  {Object} [fileOpts] Optional file related meta-data
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#sendDocument
         */
        sendDocument(chatId: ChatId, doc: string|Stream|Buffer, options?: Object, fileOpts?: Object): Promise<any>

        /**
         * Send .webp stickers.
         * @param  {Number|String} chatId  Unique identifier for the message recipient
         * @param  {String|Stream|Buffer} sticker A file path, Stream or Buffer.
         * Can also be a `file_id` previously uploaded. Stickers are WebP format files.
         * @param  {Object} [options] Additional Telegram query options
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#sendsticker
         */
        sendSticker(chatId: ChatId, sticker: string|Stream|Buffer, options?: Object): Promise<any>

        /**
         * Use this method to send video files, Telegram clients support mp4 videos (other formats may be sent as Document).
         * @param  {Number|String} chatId  Unique identifier for the message recipient
         * @param  {String|Stream|Buffer} video A file path or Stream.
         * Can also be a `file_id` previously uploaded.
         * @param  {Object} [options] Additional Telegram query options
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#sendvideo
         */
        sendVideo(chatId: ChatId, video:string|Stream|Buffer, options?: Object): Promise<any>


        /**
         * Send voice
         * @param  {Number|String} chatId  Unique identifier for the message recipient
         * @param  {String|Stream|Buffer} voice A file path, Stream or Buffer.
         * Can also be a `file_id` previously uploaded.
         * @param  {Object} [options] Additional Telegram query options
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#sendvoice
         */
        sendVoice(chatId: ChatId, voice: string|Stream|Buffer, options?: Object): Promise<any>

        /**
         * Send chat action.
         * `typing` for text messages,
         * `upload_photo` for photos, `record_video` or `upload_video` for videos,
         * `record_audio` or `upload_audio` for audio files, `upload_document` for general files,
         * `find_location` for location data.
         *
         * @param  {Number|String} chatId  Unique identifier for the message recipient
         * @param  {String} action Type of action to broadcast.
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#sendchataction
         */
        sendChatAction(chatId: ChatId, action: Action): Promise<any>

        /**
         * Use this method to kick a user from a group or a supergroup.
         * In the case of supergroups, the user will not be able to return
         * to the group on their own using invite links, etc., unless unbanned
         * first. The bot must be an administrator in the group for this to work.
         * Returns True on success.
         *
         * @param  {Number|String} chatId  Unique identifier for the target group or username of the target supergroup
         * @param  {String} userId  Unique identifier of the target user
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#kickchatmember
         */
        kickChatMember(chatId: ChatId, userId: string): Promise<any> // TODO Promise<boolean> ??

        /**
         * Use this method to unban a previously kicked user in a supergroup.
         * The user will not return to the group automatically, but will be
         * able to join via link, etc. The bot must be an administrator in
         * the group for this to work. Returns True on success.
         *
         * @param  {Number|String} chatId  Unique identifier for the target group or username of the target supergroup
         * @param  {String} userId  Unique identifier of the target user
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#unbanchatmember
         */
        unbanChatMember(chatId: ChatId, userId: string): Promise<any> // TODO Promise<boolean> ??

        /**
         * Use this method to send answers to callback queries sent from
         * inline keyboards. The answer will be displayed to the user as
         * a notification at the top of the chat screen or as an alert.
         * On success, True is returned.
         *
         * @param  {Number|String} callbackQueryId  Unique identifier for the query to be answered
         * @param  {String} text  Text of the notification. If not specified, nothing will be shown to the user
         * @param  {Boolean} showAlert  Whether to show an alert or a notification at the top of the screen
         * @param  {Object} [options] Additional Telegram query options
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#answercallbackquery
         */
        answerCallbackQuery(callbackQueryId: number|string, text: string, showAlert: boolean, options?: Object): Promise<any>

        /**
         * Use this method to edit text messages sent by the bot or via
         * the bot (for inline bots). On success, the edited Message is
         * returned.
         *
         * Note that you must provide one of chat_id, message_id, or
         * inline_message_id in your request.
         *
         * @param  {String} text  New text of the message
         * @param  {Object} [options] Additional Telegram query options (provide either one of chat_id, message_id, or inline_message_id here)
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#editmessagetext
         */
        editMessageText(text: string, options?: Object): Promise<any> // TODO (chat_id, message_id, or inline_message_id)

        /**
         * Use this method to edit captions of messages sent by the
         * bot or via the bot (for inline bots). On success, the
         * edited Message is returned.
         *
         * Note that you must provide one of chat_id, message_id, or
         * inline_message_id in your request.
         *
         * @param  {String} caption  New caption of the message
         * @param  {Object} [options] Additional Telegram query options (provide either one of chat_id, message_id, or inline_message_id here)
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#editmessagecaption
         */
        editMessageCaption(caption: string, options?: Object): Promise<any>

        /**
         * Use this method to edit only the reply markup of messages
         * sent by the bot or via the bot (for inline bots).
         * On success, the edited Message is returned.
         *
         * Note that you must provide one of chat_id, message_id, or
         * inline_message_id in your request.
         *
         * @param  {Object} replyMarkup  A JSON-serialized object for an inline keyboard.
         * @param  {Object} [options] Additional Telegram query options (provide either one of chat_id, message_id, or inline_message_id here)
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#editmessagetext
         */
        editMessageReplyMarkup(replyMarkup: Object, options?: Object): Promise<any>

        /**
         * Use this method to get a list of profile pictures for a user.
         * Returns a [UserProfilePhotos](https://core.telegram.org/bots/api#userprofilephotos) object.
         *
         * @param  {Number|String} userId  Unique identifier of the target user
         * @param  {Number} [offset] Sequential number of the first photo to be returned. By default, all photos are returned.
         * @param  {Number} [limit] Limits the number of photos to be retrieved. Values between 1—100 are accepted. Defaults to 100.
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#getuserprofilephotos
         */
        getUserProfilePhotos(userId: number|string, offset?: number, limit?: number): Promise<any>

        /**
         * Send location.
         * Use this method to send point on the map.
         *
         * @param  {Number|String} chatId  Unique identifier for the message recipient
         * @param  {Number} latitude Latitude of location
         * @param  {Number} longitude Longitude of location
         * @param  {Object} [options] Additional Telegram query options
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#sendlocation
         */
        sendLocation(chatId: ChatId, latitude: number, longitude: number, options?: Object): Promise<any>

        /**
         * Send venue.
         * Use this method to send information about a venue.
         *
         * @param  {Number|String} chatId  Unique identifier for the message recipient
         * @param  {Number} latitude Latitude of location
         * @param  {Number} longitude Longitude of location
         * @param  {String} title Name of the venue
         * @param  {String} address Address of the venue
         * @param  {Object} [options] Additional Telegram query options
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#sendvenue
         */
        sendVenue(chatId: ChatId, latitude: number, longitude: number, title: string, address: string, options?: Object): Promise<any>

        /**
         * Send contact.
         * Use this method to send phone contacts.
         *
         * @param  {Number|String} chatId  Unique identifier for the message recipient
         * @param  {String} phoneNumber Contact's phone number
         * @param  {String} firstName Contact's first name
         * @param  {Object} [options] Additional Telegram query options
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#sendcontact
         */
        sendContact(chatId: ChatId, phoneNumber: string, firstName: string, options?: Object): Promise<any>

        /**
         * Get file.
         * Use this method to get basic info about a file and prepare it for downloading.
         * Attention: link will be valid for 1 hour.
         *
         * @param  {String} fileId  File identifier to get info about
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#getfile
         */
        getFile(fileId: string): Promise<any>

        /**
         * Get link for file.
         * Use this method to get link for file for subsequent use.
         * Attention: link will be valid for 1 hour.
         *
         * This method is a sugar extension of the (getFile)[#getfilefileid] method,
         * which returns just path to file on remote server (you will have to manually build full uri after that).
         *
         * @param  {String} fileId  File identifier to get info about
         * @return {Promise} promise Promise which will have *fileURI* in resolve callback
         * @see https://core.telegram.org/bots/api#getfile
         */
        getFileLink(fileId: string): Promise<any>

        /**
         * Downloads file in the specified folder.
         * This is just a sugar for (getFile)[#getfilefiled] method
         *
         * @param  {String} fileId  File identifier to get info about
         * @param  {String} downloadDir Absolute path to the folder in which file will be saved
         * @return {Promise} promise Promise, which will have *filePath* of downloaded file in resolve callback
         */
        downloadFile(fileId: string, downloadDir: string): Promise<string>

        /**
         * Register a RegExp to test against an incomming text message.
         * @param  {RegExp}   regexp       RegExp to be executed with `exec`.
         * @param  {Function} callback     Callback will be called with 2 parameters,
         * the `msg` and the result of executing `regexp.exec` on message text.
         */
        onText(regexp: RegExp, callback: (msg: Message, match: RegExpExecArray) => any): any

        /**
         * Register a reply to wait for a message response.
         * @param  {Number|String}   chatId       The chat id where the message cames from.
         * @param  {Number|String}   messageId    The message id to be replied.
         * @param  {Function} callback     Callback will be called with the reply
         * message.
         */
        onReplyToMessage(chatId: ChatId, messageId: number|string, callback: (msg: Message) => any): any

        /**
         * Use this method to get up to date information about the chat
         * (current name of the user for one-on-one conversations, current
         * username of a user, group or channel, etc.).
         * @param  {Number|String} chatId Unique identifier for the target chat or username of the target supergroup or channel
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#getchat
         */
        getChat(chatId: ChatId): Promise<any>

        /**
         * Returns the administrators in a chat in form of an Array of `ChatMember` objects.
         * @param  {Number|String} chatId  Unique identifier for the target group or username of the target supergroup
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#getchatadministrators
         */
        getChatAdministrators(chatId: ChatId): Promise<any>

        /**
         * Use this method to get the number of members in a chat.
         * @param  {Number|String} chatId  Unique identifier for the target group or username of the target supergroup
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#getchatmemberscount
         */
        getChatMembersCount(chatId: ChatId): Promise<any>

        /**
         * Use this method to get information about a member of a chat.
         * @param  {Number|String} chatId  Unique identifier for the target group or username of the target supergroup
         * @param  {String} userId  Unique identifier of the target user
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#getchatmember
         */
        getChatMember(chatId: ChatId, userId: string): Promise<any>

        /**
         * Leave a group, supergroup or channel.
         * @param  {Number|String} chatId Unique identifier for the target group or username of the target supergroup (in the format @supergroupusername)
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#leavechat
         */
        leaveChat(chatId: ChatId): Promise<any>

        /**
         * Use this method to send a game.
         * @param  {Number|String} chatId Unique identifier for the message recipient
         * @param  {String} gameShortName name of the game to be sent.
         * @param  {Object} [options] Additional Telegram query options
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#sendgame
         */
        sendGame(chatId: ChatId, gameShortName: string, options?: Object): Promise<any>

        /**
         * Use this method to set the score of the specified user in a game.
         * @param  {String} userId  Unique identifier of the target user
         * @param  {Number} score New score value.
         * @param  {Object} [options] Additional Telegram query options
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#setgamescore
         */
        setGameScore(userId: string, score: number, options?: Object): Promise<any>

        /**
         * Use this method to get data for high score table.
         * @param  {String} userId  Unique identifier of the target user
         * @param  {Object} [options] Additional Telegram query options
         * @return {Promise}
         * @see https://core.telegram.org/bots/api#getgamehighscores
         */
        getGameHighScores(userId: string, options?: Object): Promise<any>

        /**
         * Every time TelegramBot receives a message, it emits a message.
         *
         * Depending on which message was received, emits an event from this ones:
         *   text, audio, document, photo, sticker, video, voice, contact, location, new_chat_participant,
         *   left_chat_participant, new_chat_title, new_chat_photo, delete_chat_photo, group_chat_created.
         * Its much better to listen a specific event rather than a message in order to stay safe from the content.
         *
         * TelegramBot emits callback_query when receives a Callback Query.
         * TelegramBot emits inline_query when receives an Inline Query
         * and chosen_inline_result when receives a ChosenInlineResult.
         *
         * Bot must be enabled on inline mode TelegramBot emits edited_message when a message is edited,
         * and also edited_message_text or edited_message_caption depending on which type of message was edited.
         *
         * @param event
         * @param fn
         */
        on(event: 'message', fn: (msg: Message) => any): this;
        on(event: MessageType, fn: (msg: Message) => any): this;

        // TODO: callback arguments any type
        on(event: 'callback_query', fn: (callbackQuery: any) => any): this;
        on(event: 'inline_query', fn: (inlineQuery: any) => any): this;
        on(event: 'chosen_inline_result', fn: (chosenInlineresult: any) => any): this;

        on(event: 'edited_message', fn: (editedMessage: any) => any): this;
        on(event: 'edited_message_text', fn: (editedMessageText: any) => any): this;
        on(event: 'edited_message_caption', fn: (editedMessageCaption: any) => any): this;

    }

    export = TelegramBot;
}

