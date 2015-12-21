--インフェルノイド・ヴァエル
function c80100217.initial_effect(c)
	c:SetStatus(STATUS_UNSUMMONABLE_CARD,true)
	--cannot special summon
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetCode(EFFECT_SPSUMMON_CONDITION)
	e1:SetValue(c80100217.splimit)
	c:RegisterEffect(e1)
	--special summon
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_SPSUMMON_PROC)
	e2:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e2:SetRange(LOCATION_HAND+LOCATION_GRAVE)
	e2:SetCondition(c80100217.spcon)
	e2:SetOperation(c80100217.spop)
	c:RegisterEffect(e2)	
	--remove
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e3:SetCode(EVENT_BATTLED)
	e3:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e3:SetCondition(c80100217.regcon)
	e3:SetOperation(c80100217.regop)
	c:RegisterEffect(e3)
	local e4=Effect.CreateEffect(c)
	e4:SetDescription(aux.Stringid(80100217,0))
	e4:SetCategory(CATEGORY_REMOVE)
	e4:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e4:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e4:SetCode(EVENT_PHASE+PHASE_BATTLE)
	e4:SetCountLimit(1)
	e4:SetRange(LOCATION_MZONE)
	e4:SetCondition(c80100217.removecon)
	e4:SetTarget(c80100217.removetg)
	e4:SetOperation(c80100217.removeop)
	c:RegisterEffect(e4)
	--remove
	local e5=Effect.CreateEffect(c)
	e5:SetDescription(aux.Stringid(80100217,1))
	e5:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e5:SetCategory(CATEGORY_REMOVE)
	e5:SetType(EFFECT_TYPE_QUICK_O)
	e5:SetRange(LOCATION_MZONE)
	e5:SetCode(EVENT_FREE_CHAIN)
	e5:SetCountLimit(1)
	e5:SetCondition(c80100217.rmcon)
	e5:SetCost(c80100217.rmcost)
	e5:SetTarget(c80100217.rmtg)
	e5:SetOperation(c80100217.rmop)
	c:RegisterEffect(e5)
end
function c80100217.splimit(e,se,sp,st)
	return e:GetHandler()==se:GetHandler()
end
function c80100217.spfilter(c)
	return c:IsSetCard(0xb9) and c:IsAbleToRemoveAsCost()
end
function c80100217.confilter(c)
	return c:IsFaceup() and c:IsType(TYPE_EFFECT)
end
function c80100217.spcon(e,c)
	if c==nil then return true end
	local tp=c:GetControler()
	local g=Duel.GetMatchingGroup(c80100217.confilter,c:GetControler(),LOCATION_MZONE,0,nil)	 
	local fc=Duel.GetFieldCard(tp,LOCATION_SZONE,5)
	local loc=LOCATION_GRAVE+LOCATION_HAND
	if fc and fc:IsHasEffect(80100258) then
		loc= loc + LOCATION_MZONE
	end
	return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c80100217.spfilter,tp,loc,0,3,c)
		and (g:GetSum(Card.GetLevel)+g:GetSum(Card.GetRank))<9
end
function c80100217.spop(e,tp,eg,ep,ev,re,r,rp,c)
	local fc=Duel.GetFieldCard(tp,LOCATION_SZONE,5)
	local loc=LOCATION_GRAVE+LOCATION_HAND
	if fc and fc:IsHasEffect(80100258) then
		loc= loc + LOCATION_MZONE
	end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g=Duel.SelectMatchingCard(tp,c80100217.spfilter,tp,loc,0,3,3,c)
	Duel.Remove(g,POS_FACEUP,REASON_COST)
end
function c80100217.regcon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetAttackTarget()~=nil
end
function c80100217.regop(e,tp,eg,ep,ev,re,r,rp)
	e:GetHandler():RegisterFlagEffect(80100217,RESET_EVENT+0x1fc0000+RESET_PHASE+PHASE_END,0,1)
end
function c80100217.removecon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetFlagEffect(80100217)>0
end
function c80100217.removetg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsOnField() and chkc:IsAbleToRemove() end
	if chk==0 then return true end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g=Duel.SelectTarget(tp,Card.IsAbleToRemove,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_REMOVE,g,g:GetCount(),0,0)
end
function c80100217.removeop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc and tc:IsRelateToEffect(e) then
		Duel.Remove(tc,POS_FACEUP,REASON_EFFECT)
	end
end
function c80100217.rmcon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnPlayer(tp,LOCATION_MZONE,0)~=tp
end
function c80100217.rmcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.CheckReleaseGroup(tp,nil,1,nil) end
	local cg=Duel.SelectReleaseGroup(tp,nil,1,1,nil)
	Duel.Release(cg,REASON_COST)
end
function c80100217.rmtg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(1-tp) and chkc:IsAbleToRemove() end
	if chk==0 then return Duel.IsExistingTarget(Card.IsAbleToRemove,tp,0,LOCATION_GRAVE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g=Duel.SelectTarget(tp,Card.IsAbleToRemove,tp,0,LOCATION_GRAVE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_REMOVE,g,g:GetCount(),0,0)
end
function c80100217.rmop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.Remove(tc,POS_FACEUP,REASON_EFFECT)
	end
end