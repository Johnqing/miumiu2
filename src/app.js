
import React, {Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Image,
  Dimensions,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import Video from 'react-native-video';
import Modal from 'react-native-modal';

const winPadding = 15;

const url = `https://fm.douban.com/j/v2/playlist?channel=-10&kbps=128&client=s%3Amainsite%7Cy%3A3.0&app_name=radio_website&version=100&type=s&sid=123247&pt=53930.294&pb=128&apikey=`;
const musicWordsUrl = `https://fm.douban.com/j/v2/lyric`
// const defaultData = require('./data.json')
// const song = defaultData.song[0];
const win = Dimensions.get('window');
const screenWidth = win.width - (winPadding * 2);
class App extends Component{
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            modalVisible: false,
            status: true,
            // 音乐状态控制
            pause: false,
            playModel: 1, //1正常 2单曲循环
            // 资源控制
            url: '',
            artist: '',
            title: '',
            image: '',
            // 初始化
            sliderTime: 0,
            currentTime: 0,
            duration: 0,
            width: 500,
            height: 500
        };
    }
    componentDidMount() {
        this.loadSongInfo();
    }
    loadSongInfo(){
        fetch(url).then((response) => response.json())
        .then((data) => {
            return data.song[0];
        })
        .then((song) => {
            Image.getSize(song.picture, (defWidth, defHeight) => {
                const diff = screenWidth/defWidth;
                const width = defWidth * diff;
                const height = Math.floor(screenWidth/defWidth * defHeight);
                this.setState({width, height});
            });
            this.setState({
                sid: song.sid,
                ssid: song.ssid,
                url: song.url,
                artist: song.artist,
                title: song.title,
                image: song.picture,
            });
        }).then(() => {
            return fetch(`${musicWordsUrl}?sid=${this.state.sid}&ssid=${this.state.ssid}`)
        }).then((response) => response.json())
        .then((data) => {
            this.setState({
                words: data.lyric
            })
        })
    }
    onLoad(data){
        this.setState({ duration: data.duration });
    }
    onEnd(){
        // 单曲循环
        if(this.state.playModel === 2){
            this.video.seek(0) //让video 重新播放
            return;
        }
        // next
        this.loadSongInfo();
    }
    onProgress(data){
        const sliderTime = parseInt(data.currentTime);
        const barWidth = screenWidth * (sliderTime/this.state.duration);
        this.setState({
            barWidth,
            sliderTime,
            currentTime: data.currentTime
        });
    }
    onPlayModel(model){
        let m = model + 1;
        m = m === 3 ? 1 : m;
        console.log('model', m);
        this.setState({
            playModel: m
        })
    }
    onPlay(){
        const status = !this.state.pause;
        this.setState({
            pause: status
        })
    }
    onNext(){
        this.loadSongInfo();
    }
    onWord(){
        this.setState({
            modalVisible: !this.state.modalVisible
        })
    }
    formatTime(time) {
        time = Math.floor(time);
        // 71s -> 01:11
        let min = Math.floor(time / 60)
        let second = time - min * 60
        min = min >= 10 ? min : '0' + min
        second = second >= 10 ? second : '0' + second
        return min + ':' + second
    }
    render(){
        if(!this.state.image){
            return null;
        }
        return (
            <>
                <StatusBar barStyle="dark-content" />
                <SafeAreaView>
                    <View style={styles.body}>
                        <Image
                            style={[styles.pic, {
                                width: this.state.width, height: this.state.height,
                            }]}
                            source={{
                                uri: this.state.image
                            }}
                        />
                        <View style={styles.musicText}>
                            <View>
                                <Text style={styles.musicTitle}>{this.state.title}</Text>
                            </View>
                            <View style={styles.artistNameBody}>
                                <Text style={styles.artistName}>{this.state.artist}</Text>
                            </View>
                        </View>
                        <Video
                            source={{uri: this.state.url}}
                            ref={(ref) => {
                                this.video = ref
                            }}
                            volume={1.0}
                            paused={this.state.pause}
                            onProgress={(e) => this.onProgress(e)}
                            onLoad={(e) => this.onLoad(e)}
                            onEnd={(e) => this.onEnd(e)}
                            playInBackground={true}
                        />
                        <View style={styles.barBody}>
                            <View style={[styles.bar, {width: this.state.barWidth}]}></View>
                            <View style={styles.barTime}>
                                <Text style={styles.barCurrTime}>{this.formatTime(this.state.sliderTime)}</Text>
                                <Text style={styles.barTotalTime}>{this.formatTime(this.state.duration)}</Text>
                            </View>
                        </View>
                        <View style={styles.playingBox}>
                            <View style={styles.refreshBody}>
                                <TouchableOpacity onPress={()=>this.onPlayModel(this.state.playModel)}>
                                    <Image style={styles.refresh} source={require('./img/refresh.png')} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.prevBody}>
                                {/* <TouchableOpacity onPress={()=>this.onPrev()}>
                                    <Image style={styles.prev} source={require('./img/next.png')} />
                                </TouchableOpacity> */}
                            </View>
                            <View style={styles.playBody}>
                                <TouchableOpacity onPress={()=>this.onPlay(this.state.pause)}>
                                {
                                    !this.state.pause ? <Image style={[styles.play, { marginLeft: 0 }]} source={require('./img/pause.png')} /> : <Image style={styles.play} source={require('./img/play.png')} />
                                }
                                </TouchableOpacity>
                            </View>
                            <View style={styles.nextBody}>
                                <TouchableOpacity onPress={()=>this.onNext()}>
                                    <Image style={styles.next} source={require('./img/next.png')} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.musicWordsBody}>
                                <TouchableOpacity onPress={()=>this.onWord()}>
                                    <Image style={styles.musicWords} source={require('./img/list.png')} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
                <Modal
                    backdropOpacity={0.5}
                    animationIn={'slideInUp'}
                    deviceHeight={500}
                    isVisible={this.state.modalVisible}
                    style={styles.modal}
                    >
                    <View style={styles.modalContent}>
                        <ScrollView
                            contentInsetAdjustmentBehavior="automatic"
                            style={styles.scrollView}
                        >
                            <Text style={styles.musicWordsText}>{this.state.words || ''}</Text>
                        </ScrollView>
                        <View style={styles.button}>
                            <TouchableOpacity style={{
                                height: 40,
                                width: win.width,
                                textAlign: 'center',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }} onPress={() => {
                                this.onWord()
                            }}>
                                <Text style={styles.buttonText}>关闭</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </>
        )
    }
}

const styles = StyleSheet.create({
    pic: {
        borderRadius: 10
    },
    body: {
        paddingLeft: winPadding,
        paddingRight: winPadding
    },
    musicText: {
        marginTop: 20,
        marginBottom: 20
    },
    musicTitle: {
        textAlign: "center",
        fontSize: 25
    },
    artistNameBody: {
        marginTop: 5,
    },
    artistName: {
        textAlign: "center",
        fontSize: 18,
        color: '#666666'
    },
    playingBox: {
        marginTop: 20,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'

    },
    refreshBody: {
        width: 30,
        height: 30,
    },
    refresh: {
        width: 30,
        height: 30,
    },
    prevBody: {
        width: 30,
        height: 30,
        transform: [{rotate:'180deg'}]
    },
    prev: {
        width: 30,
        height: 30,
    },
    playBody: {
        borderColor: '#40dae0',
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 50,
        width: 50,
        height: 50,
        padding: 5,
        backgroundColor: '#48dae0',
    },
    play: {
        marginLeft: 2,
        width: 40,
        height: 40,
    },
    nextBody: {
        width: 30,
        height: 30,
    },
    next: {
        width: 30,
        height: 30,
    },
    musicWordsBody:{
        width: 30,
        height: 30,
    },
    musicWords: {
        width: 30,
        height: 30,
    },
    //bar
    bar: {
        height: 2,
        backgroundColor: '#48dae0'
    },
    barTime: {
        marginTop: 5,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#999999'
    },
    barCurrTime: {
        color: '#999999'
    },
    barTotalTime: {
        color: '#999999'
    },
    scrollView: {
    },
    modal: {
        marginLeft: 0,
        marginRight: 0,
        marginBottom: 8,
        justifyContent: 'flex-end',
    },
    modalContent: {
        position: 'relative',
        paddingLeft: 10,
        paddingRight: 10,
        height: (win.height/2) - 60,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    musicWordsText: {
        color: '#fff',
        lineHeight: 25,
        paddingBottom: 20,
    },
    button: {
        position: 'absolute',
        bottom: -8,
        left: 0,
        right: 0,
        height: 50,
        backgroundColor: 'rgba(0,0,0,0.8)'
    },
    buttonText: {
        color: '#fff'
    }
});
export default App;
