--Ｎｏ．４６神影龍 ドラッグルーオン
function c80600050.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,aux.XyzFilterFunctionF(c,aux.FilterBoolFunction(Card.IsRace,RACE_DRAGON),8),2)
	c:EnableReviveLimit()
	--spsummon
	--local e1=Effect.CreateEffect(c)
	--e1:SetDescription(aux.Stringid(80600050,0))
	--e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	--e1:SetType(EFFECT_TYPE_IGNITION)
	--e1:SetRange(LOCATION_MZONE)
	--e1:SetCode(EVENT_FREE_CHAIN)
	--e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	--e1:SetCountLimit(1)
	--e1:SetCondition(c80600050.condition)
	--e1:SetCost(c80600050.cost)
	--e1:SetTarget(c80600050.sptg)
	--e1:SetOperation(c80600050.spop)
	--c:RegisterEffect(e1)
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80600050,0))
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetRange(LOCATION_MZONE)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c80600050.condition)
	e1:SetCost(c80600050.cost)
	e1:SetTarget(c80600050.sptg)
	e1:SetOperation(c80600050.spop)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_CONTROL)
    e2:SetDescription(aux.Stringid(80600050,1))
	--e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCountLimit(1)
	e2:SetCondition(c80600050.condition)
	e2:SetCost(c80600050.cost)
	e2:SetTarget(c80600050.contg)
	e2:SetOperation(c80600050.conop)
	c:RegisterEffect(e2)
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80600050,2))
	e3:SetType(EFFECT_TYPE_IGNITION)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCountLimit(1)
	e3:SetCondition(c80600050.condition)
	e3:SetCost(c80600050.cost)
	e3:SetTarget(c80600050.distg)
	e3:SetOperation(c80600050.disop)
	c:RegisterEffect(e3)
end
function c80600050.condition(e)
	return Duel.GetFieldGroupCount(e:GetHandlerPlayer(),LOCATION_MZONE,0)<=1
end
function c80600050.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():GetFlagEffect(80600050)==0
		and e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RegisterFlagEffect(80600050,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end
function c80600050.spfilter(c,e,tp)
	return c:IsRace(RACE_DRAGON) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c80600050.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chkc then return chkc:IsLocation(LOCATION_HAND) and c80600050.spfilter(chkc,e,tp) end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingTarget(c80600050.spfilter,tp,LOCATION_HAND,0,1,nil,e,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c80600050.spfilter,tp,LOCATION_HAND,0,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,1,0,0)
end
function c80600050.spop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP)
	end
end
function c80600050.confilter(c,e,tp)
	return c:IsRace(RACE_DRAGON) and c:IsFaceup() and c:IsControlerCanBeChanged(e,0,tp,false,false)
end
function c80600050.contg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:GetLocation()==LOCATION_MZONE and chkc:GetControler()~=tp and c80600050.confilter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c80600050.confilter,tp,0,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_CONTROL)
	local g=Duel.SelectTarget(tp,c80600050.confilter,tp,0,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_CONTROL,g,1,0,0)
end
function c80600050.conop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) and not Duel.GetControl(tc,tp) then
		if not tc:IsImmuneToEffect(e) and tc:IsAbleToChangeControler() then
			Duel.Destroy(tc,REASON_EFFECT)
		end
	end
end
function c80600050.disfilter(c,e,tp)
	return c:IsRace(RACE_DRAGON) and c:IsFaceup() 
end
function c80600050.distg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
   if chk==0 then return Duel.IsExistingMatchingCard(c80600050.disfilter,tp,0,LOCATION_MZONE,1,nil) end
end
function c80600050.disop(e,tp,eg,ep,ev,re,r,rp,chk)
 	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetCode(EFFECT_CANNOT_ACTIVATE)
	e1:SetTargetRange(0,1)
	e1:SetValue(c80600050.aclimit)
	e1:SetReset(RESET_PHASE+PHASE_END)
	Duel.RegisterEffect(e1,tp)
end
function c80600050.aclimit(e,re,tp)
	return re:GetHandler():IsRace(RACE_DRAGON) and re:GetHandler():IsLocation(LOCATION_MZONE)
end

