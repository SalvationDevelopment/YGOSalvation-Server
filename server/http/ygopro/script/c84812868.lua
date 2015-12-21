--Scripted by Eerie Code
--Moon-Light White Rabbit
function c84812868.initial_effect(c)
	--special summon
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(84812868,0))
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCode(EVENT_SUMMON_SUCCESS)
	e1:SetTarget(c84812868.target)
	e1:SetOperation(c84812868.operation)
	c:RegisterEffect(e1)
	--Back to hand
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(84812868,1))
	e3:SetType(EFFECT_TYPE_IGNITION)
	e3:SetCategory(CATEGORY_TOHAND)
	e3:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCountLimit(1)
	e3:SetTarget(c84812868.destg)
	e3:SetOperation(c84812868.desop)
	c:RegisterEffect(e3)
end

function c84812868.filter(c,e,tp)
	return (c:IsSetCard(0xe1) or c:IsSetCard(0x209)) and not c:IsCode(84812868) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c84812868.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(tp) and c84812868.filter(chkc,e,tp) end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingTarget(c84812868.filter,tp,LOCATION_GRAVE,0,1,nil,e,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c84812868.filter,tp,LOCATION_GRAVE,0,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,1,0,0)
end
function c84812868.operation(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP_DEFENCE)
	end
end

function c84812868.cfilter(c)
	return c:IsFaceup() and (c:IsSetCard(0xe1) or c:IsSetCard(0x209))
end
function c84812868.destg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_SZONE) and chkc:IsControler(1-tp) and chkc:IsAbleToHand() end
	if chk==0 then return Duel.IsExistingMatchingCard(c84812868.cfilter,tp,LOCATION_MZONE,0,1,e:GetHandler())
		and Duel.IsExistingTarget(Card.IsAbleToHand,tp,0,LOCATION_SZONE,1,nil) end
	local ct=Duel.GetMatchingGroupCount(c84812868.cfilter,tp,LOCATION_MZONE,0,e:GetHandler())
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_RTOHAND)
	local g=Duel.SelectTarget(tp,Card.IsAbleToHand,tp,0,LOCATION_SZONE,1,ct,nil)
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,g,g:GetCount(),0,0)
end
function c84812868.desop(e,tp,eg,ep,ev,re,r,rp)
	local tg=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	local g=tg:Filter(Card.IsRelateToEffect,nil,e)
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
	end
end