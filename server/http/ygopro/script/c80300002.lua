--ライトロード・メイデン ミネルバ
--TCG Version
function c80300002.initial_effect(c)
	--search
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80300002,0))
	e1:SetCategory(CATEGORY_TOHAND+CATEGORY_SEARCH)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCode(EVENT_SUMMON_SUCCESS)
	e1:SetTarget(c80300002.thtg)
	e1:SetOperation(c80300002.thop)
	c:RegisterEffect(e1)
	--discard deck
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80300002,1))
	e2:SetCategory(CATEGORY_DECKDES)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e2:SetCode(EVENT_TO_GRAVE)
	e2:SetCondition(c80300002.discon)
	e2:SetTarget(c80300002.distg)
	e2:SetOperation(c80300002.disop)
	c:RegisterEffect(e2)
	--discard deck2
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e3:SetDescription(aux.Stringid(80300002,2))
	e3:SetProperty(EFFECT_FLAG_REPEAT)
	e3:SetCategory(CATEGORY_DECKDES)
	e3:SetCode(EVENT_PHASE+PHASE_END)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCountLimit(1)
	e3:SetCondition(c80300002.discon2)
	e3:SetTarget(c80300002.distg2)
	e3:SetOperation(c80300002.disop2)
	c:RegisterEffect(e3)
end
function c80300002.sfilter(c)
	return c:IsSetCard(0x38) and c:IsType(TYPE_MONSTER)
end
function c80300002.thfilter(c,lv)
	return c:IsLevelBelow(lv) and c:IsRace(RACE_DRAGON) and c:IsAttribute(ATTRIBUTE_LIGHT) and c:IsAbleToHand()
end
function c80300002.thtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then
		local g=Duel.GetMatchingGroup(c80300002.sfilter,tp,LOCATION_GRAVE,0,nil)
		local count=g:GetClassCount(Card.GetCode)
		return Duel.IsExistingMatchingCard(c80300002.thfilter,tp,LOCATION_DECK,0,1,nil,count)
	end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_DECK)
end
function c80300002.thop(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetMatchingGroup(c80300002.sfilter,tp,LOCATION_GRAVE,0,nil)
	local count=g:GetClassCount(Card.GetCode)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local sg=Duel.SelectMatchingCard(tp,c80300002.thfilter,tp,LOCATION_DECK,0,1,1,nil,count)
	if sg:GetCount()>0 then
		Duel.SendtoHand(sg,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,sg)
	end
end
function c80300002.discon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetPreviousLocation()==LOCATION_HAND
		or e:GetHandler():GetPreviousLocation()==LOCATION_DECK
end
function c80300002.distg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsPlayerCanDiscardDeck(tp,1) end
	Duel.SetTargetPlayer(tp)
	Duel.SetTargetParam(1)
	Duel.SetOperationInfo(0,CATEGORY_DECKDES,nil,0,tp,1)
end
function c80300002.disop(e,tp,eg,ep,ev,re,r,rp)
	local p,val=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER,CHAININFO_TARGET_PARAM)
	Duel.DiscardDeck(p,val,REASON_EFFECT)
end
function c80300002.discon2(e,tp,eg,ep,ev,re,r,rp)
	return tp==Duel.GetTurnPlayer()
end
function c80300002.distg2(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_DECKDES,nil,0,tp,2)
end
function c80300002.disop2(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:GetControler()~=tp or not c:IsRelateToEffect(e) or c:IsFacedown() then return end
	Duel.DiscardDeck(tp,2,REASON_EFFECT)
end
