--インフェルノイド・アシュメダイ
function c80100216.initial_effect(c)
	c:SetStatus(STATUS_UNSUMMONABLE_CARD,true)
	--cannot special summon
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetCode(EFFECT_SPSUMMON_CONDITION)
	e1:SetValue(c80100216.splimit)
	c:RegisterEffect(e1)
	--special summon
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_SPSUMMON_PROC)
	e2:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e2:SetRange(LOCATION_HAND+LOCATION_GRAVE)
	e2:SetCondition(c80100216.spcon)
	e2:SetOperation(c80100216.spop)
	c:RegisterEffect(e2)	
	--handes
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80100216,0))
	e3:SetCategory(CATEGORY_HANDES)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e3:SetCode(EVENT_BATTLE_DAMAGE)
	e3:SetCondition(c80100216.condition)
	e3:SetTarget(c80100216.target)
	e3:SetOperation(c80100216.operation)
	c:RegisterEffect(e3)
	--remove
	local e4=Effect.CreateEffect(c)
	e4:SetDescription(aux.Stringid(80100216,1))
	e4:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e4:SetCategory(CATEGORY_REMOVE)
	e4:SetType(EFFECT_TYPE_QUICK_O)
	e4:SetRange(LOCATION_MZONE)
	e4:SetCode(EVENT_FREE_CHAIN)
	e4:SetCountLimit(1)
	e4:SetCondition(c80100216.rmcon)
	e4:SetCost(c80100216.rmcost)
	e4:SetTarget(c80100216.rmtg)
	e4:SetOperation(c80100216.rmop)
	c:RegisterEffect(e4)
end
function c80100216.splimit(e,se,sp,st)
	return e:GetHandler()==se:GetHandler()
end
function c80100216.spfilter(c)
	return c:IsSetCard(0xb9) and c:IsAbleToRemoveAsCost()
end
function c80100216.confilter(c)
	return c:IsFaceup() and c:IsType(TYPE_EFFECT)
end
function c80100216.spcon(e,c)
	if c==nil then return true end
	local tp=c:GetControler()
	local g=Duel.GetMatchingGroup(c80100216.confilter,c:GetControler(),LOCATION_MZONE,0,nil)	 
	local fc=Duel.GetFieldCard(tp,LOCATION_SZONE,5)
	local loc=LOCATION_GRAVE+LOCATION_HAND
	if fc and fc:IsHasEffect(80100258) then
		loc= loc + LOCATION_MZONE
	end
	return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c80100216.spfilter,tp,loc,0,2,c)
		and (g:GetSum(Card.GetLevel)+g:GetSum(Card.GetRank))<9
end
function c80100216.spop(e,tp,eg,ep,ev,re,r,rp,c)
	local fc=Duel.GetFieldCard(tp,LOCATION_SZONE,5)
	local loc=LOCATION_GRAVE+LOCATION_HAND
	if fc and fc:IsHasEffect(80100258) then
		loc= loc + LOCATION_MZONE
	end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g=Duel.SelectMatchingCard(tp,c80100216.spfilter,tp,loc,0,2,2,c)
	Duel.Remove(g,POS_FACEUP,REASON_COST)
end
function c80100216.condition(e,tp,eg,ep,ev,re,r,rp)
	return ep~=tp and Duel.GetAttackTarget()~=nil
end
function c80100216.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_HANDES,0,0,1-tp,1)
end
function c80100216.operation(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetFieldGroup(ep,LOCATION_HAND,0,nil)
	if g:GetCount()==0 then return end
	local sg=g:RandomSelect(ep,1)
	Duel.SendtoGrave(sg,REASON_DISCARD+REASON_EFFECT)
end
function c80100213.rmcon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnPlayer(tp,LOCATION_MZONE,0)~=tp
end
function c80100213.rmcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.CheckReleaseGroup(tp,nil,1,nil) end
	local cg=Duel.SelectReleaseGroup(tp,nil,1,1,nil)
	Duel.Release(cg,REASON_COST)
end
function c80100213.rmtg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(1-tp) and chkc:IsAbleToRemove() end
	if chk==0 then return Duel.IsExistingTarget(Card.IsAbleToRemove,tp,0,LOCATION_GRAVE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g=Duel.SelectTarget(tp,Card.IsAbleToRemove,tp,0,LOCATION_GRAVE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_REMOVE,g,g:GetCount(),0,0)
end
function c80100213.rmop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.Remove(tc,POS_FACEUP,REASON_EFFECT)
	end
end