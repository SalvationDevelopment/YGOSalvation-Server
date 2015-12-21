-- インフェルノイド・アドラメレク
function c80100218.initial_effect(c)
	c:SetStatus(STATUS_UNSUMMONABLE_CARD,true)
	--cannot special summon
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetCode(EFFECT_SPSUMMON_CONDITION)
	e1:SetValue(c80100218.splimit)
	c:RegisterEffect(e1)
	--special summon
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_SPSUMMON_PROC)
	e2:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e2:SetRange(LOCATION_HAND+LOCATION_GRAVE)
	e2:SetCondition(c80100218.spcon)
	e2:SetOperation(c80100218.spop)
	c:RegisterEffect(e2)	
	--chain attack
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80100218,0))
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e3:SetCode(EVENT_BATTLE_DESTROYING)
	e3:SetCondition(c80100218.atcon)
	e3:SetOperation(c80100218.atop)
	c:RegisterEffect(e3)
	--remove
	local e4=Effect.CreateEffect(c)
	e4:SetDescription(aux.Stringid(80100218,1))
	e4:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e4:SetCategory(CATEGORY_REMOVE)
	e4:SetType(EFFECT_TYPE_QUICK_O)
	e4:SetRange(LOCATION_MZONE)
	e4:SetCode(EVENT_FREE_CHAIN)
	e4:SetCountLimit(1)
	e4:SetCondition(c80100218.rmcon)
	e4:SetCost(c80100218.rmcost)
	e4:SetTarget(c80100218.rmtg)
	e4:SetOperation(c80100218.rmop)
	c:RegisterEffect(e4)
end
function c80100218.splimit(e,se,sp,st)
	return e:GetHandler()==se:GetHandler()
end
function c80100218.spfilter(c)
	return c:IsSetCard(0xb9) and c:IsAbleToRemoveAsCost()
end
function c80100218.confilter(c)
	return c:IsFaceup() and c:IsType(TYPE_EFFECT)
end
function c80100218.spcon(e,c)
	if c==nil then return true end
	local tp=c:GetControler()
	local g=Duel.GetMatchingGroup(c80100218.confilter,c:GetControler(),LOCATION_MZONE,0,nil)	 
	local fc=Duel.GetFieldCard(tp,LOCATION_SZONE,5)
	local loc=LOCATION_GRAVE+LOCATION_HAND
	if fc and fc:IsHasEffect(80100258) then
		loc= loc + LOCATION_MZONE
	end
	return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c80100218.spfilter,tp,loc,0,2,c)
		and (g:GetSum(Card.GetLevel)+g:GetSum(Card.GetRank))<9
end
function c80100218.spop(e,tp,eg,ep,ev,re,r,rp,c)
	local fc=Duel.GetFieldCard(tp,LOCATION_SZONE,5)
	local loc=LOCATION_GRAVE+LOCATION_HAND
	if fc and fc:IsHasEffect(80100258) then
		loc= loc + LOCATION_MZONE
	end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g=Duel.SelectMatchingCard(tp,c80100218.spfilter,tp,loc,0,2,2,c)
	Duel.Remove(g,POS_FACEUP,REASON_COST)
end
function c80100218.atcon(e,tp,eg,ep,ev,re,r,rp)
	local ec=e:GetHandler():GetEquipTarget()
	if not eg or not eg:IsContains(ec) then return false end
	local bc=ec:GetBattleTarget()
	return bc:IsReason(REASON_BATTLE) and bc:IsLocation(LOCATION_GRAVE) and ec:IsChainAttackable(2,true)
end
function c80100218.atop(e,tp,eg,ep,ev,re,r,rp)
	Duel.ChainAttack()
end
function c80100218.rmcon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnPlayer(tp,LOCATION_MZONE,0)~=tp
end
function c80100218.rmcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.CheckReleaseGroup(tp,nil,1,nil) end
	local cg=Duel.SelectReleaseGroup(tp,nil,1,1,nil)
	Duel.Release(cg,REASON_COST)
end
function c80100218.rmtg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(1-tp) and chkc:IsAbleToRemove() end
	if chk==0 then return Duel.IsExistingTarget(Card.IsAbleToRemove,tp,0,LOCATION_GRAVE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g=Duel.SelectTarget(tp,Card.IsAbleToRemove,tp,0,LOCATION_GRAVE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_REMOVE,g,g:GetCount(),0,0)
end
function c80100218.rmop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.Remove(tc,POS_FACEUP,REASON_EFFECT)
	end
end