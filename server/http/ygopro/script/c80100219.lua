--インフェルノイド・ネヘモス
function c80100219.initial_effect(c)
	c:SetStatus(STATUS_UNSUMMONABLE_CARD,true)
	--cannot special summon
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetCode(EFFECT_SPSUMMON_CONDITION)
	e1:SetValue(c80100219.splimit)
	c:RegisterEffect(e1)
	--special summon
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_SPSUMMON_PROC)
	e2:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e2:SetRange(LOCATION_HAND+LOCATION_GRAVE)
	e2:SetCondition(c80100219.spcon)
	e2:SetOperation(c80100219.spop)
	c:RegisterEffect(e2)
	--destroy
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80100219,0))
	e3:SetCategory(CATEGORY_DESTROY)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e3:SetCode(EVENT_SPSUMMON_SUCCESS)
	e3:SetTarget(c80100219.destg)
	e3:SetOperation(c80100219.desop)
	c:RegisterEffect(e3)
	--negate
	local e4=Effect.CreateEffect(c)
	e4:SetDescription(aux.Stringid(80100219,1))
	e4:SetCategory(CATEGORY_NEGATE+CATEGORY_DESTROY)
	e4:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DAMAGE_CAL)
	e4:SetType(EFFECT_TYPE_QUICK_O)
	e4:SetRange(LOCATION_MZONE)
	e4:SetCountLimit(1)
	e4:SetCode(EVENT_CHAINING)
	e4:SetCountLimit(1)
	e4:SetCondition(c80100219.discon)
	e4:SetCost(c80100219.discost)
	e4:SetTarget(c80100219.distg)
	e4:SetOperation(c80100219.disop)
	c:RegisterEffect(e4)
end
function c80100219.splimit(e,se,sp,st)
	return e:GetHandler()==se:GetHandler()
end
function c80100219.spfilter(c)
	return c:IsSetCard(0xb9) and c:IsAbleToRemoveAsCost()
end
function c80100219.confilter(c)
	return c:IsFaceup() and c:IsType(TYPE_EFFECT)
end
function c80100219.spcon(e,c)
	if c==nil then return true end
	local tp=c:GetControler()
	local g=Duel.GetMatchingGroup(c80100219.confilter,c:GetControler(),LOCATION_MZONE,0,nil)	 
	local fc=Duel.GetFieldCard(tp,LOCATION_SZONE,5)
	local loc=LOCATION_GRAVE+LOCATION_HAND
	if fc and fc:IsHasEffect(80100258) then
		loc= loc + LOCATION_MZONE
	end
	return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c80100219.spfilter,tp,loc,0,3,c)
		and (g:GetSum(Card.GetLevel)+g:GetSum(Card.GetRank))<9
end
function c80100219.spop(e,tp,eg,ep,ev,re,r,rp,c)
	local fc=Duel.GetFieldCard(tp,LOCATION_SZONE,5)
	local loc=LOCATION_GRAVE+LOCATION_HAND
	if fc and fc:IsHasEffect(80100258) then
		loc= loc + LOCATION_MZONE
	end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g=Duel.SelectMatchingCard(tp,c80100219.spfilter,tp,loc,0,3,3,c)
	Duel.Remove(g,POS_FACEUP,REASON_COST)
end
function c80100219.desfilter(c)
	return c:IsDestructable()
end
function c80100219.destg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	local g=Duel.GetMatchingGroup(c80100219.desfilter,tp,LOCATION_MZONE,LOCATION_MZONE,e:GetHandler())
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,g:GetCount(),0,0)
end
function c80100219.desop(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetMatchingGroup(c80100219.desfilter,tp,LOCATION_MZONE,LOCATION_MZONE,e:GetHandler())
	Duel.Destroy(g,REASON_EFFECT)
end
function c80100219.discost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.CheckReleaseGroup(tp,nil,1,nil) end
	local cg=Duel.SelectReleaseGroup(tp,nil,1,1,nil)
	Duel.Release(cg,REASON_COST)
end
function c80100219.discon(e,tp,eg,ep,ev,re,r,rp)
	return not e:GetHandler():IsStatus(STATUS_BATTLE_DESTROYED)
		and (re:IsHasType(EFFECT_TYPE_ACTIVATE) or not re:IsActiveType(TYPE_MONSTER)) and Duel.IsChainNegatable(ev)
end
function c80100219.distg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_NEGATE,eg,1,0,0)
	if re:GetHandler():IsAbleToRemove() and re:GetHandler():IsRelateToEffect(re) then
		Duel.SetOperationInfo(0,CATEGORY_REMOVE,eg,1,0,0)
	end
end
function c80100219.disop(e,tp,eg,ep,ev,re,r,rp)
	Duel.NegateActivation(ev)
	if re:GetHandler():IsRelateToEffect(re) then
		Duel.Remove(eg,POS_FACEUP,REASON_EFFECT)
	end
end
