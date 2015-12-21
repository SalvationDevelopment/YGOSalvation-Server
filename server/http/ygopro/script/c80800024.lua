--ゴーストリック・スケルトン
function c80800024.initial_effect(c)
	--summon limit
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_CANNOT_SUMMON)
	e1:SetCondition(c80800024.sumcon)
	c:RegisterEffect(e1)
	--turn set
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80800024,0))
	e2:SetCategory(CATEGORY_POSITION)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_MZONE)
	e2:SetTarget(c80800024.postg)
	e2:SetOperation(c80800024.posop)
	c:RegisterEffect(e2)
	--banish
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80800024,1))
	e3:SetCategory(CATEGORY_REMOVE)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e3:SetProperty(EFFECT_FLAG_CHAIN_UNIQUE+EFFECT_FLAG_DAMAGE_STEP)
	e3:SetCode(EVENT_FLIP)
	e3:SetCost(c80800024.thcost)
	e3:SetTarget(c80800024.thtg)
	e3:SetOperation(c80800024.thop)
	c:RegisterEffect(e3)
end
function c80800024.sfilter(c)
	return c:IsFaceup() and c:IsSetCard(0x8d)
end
function c80800024.sumcon(e)
	return not Duel.IsExistingMatchingCard(c80800024.sfilter,e:GetHandlerPlayer(),LOCATION_MZONE,0,1,nil)
end
function c80800024.postg(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then return c:IsCanTurnSet() and c:GetFlagEffect(80800024)==0 end
	c:RegisterFlagEffect(80800024,RESET_EVENT+0x1fc0000+RESET_PHASE+PHASE_END,0,1)
	Duel.SetOperationInfo(0,CATEGORY_POSITION,c,1,0,0)
end
function c80800024.posop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) and c:IsFaceup() then
		Duel.ChangePosition(c,POS_FACEDOWN_DEFENCE)
	end
end
function c80800024.thcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80800024)==0 end
	Duel.RegisterFlagEffect(tp,80800024,RESET_PHASE+PHASE_END,0,1)
end
function c80800024.thtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_REMOVE,nil,1,tp,LOCATION_DECK)
end
function c80800024.thop(e,tp,eg,ep,ev,re,r,rp)
	local mct=Duel.GetMatchingGroupCount(c80800024.sfilter,tp,LOCATION_MZONE,0,nil)
	local dct=Duel.GetFieldGroupCount(tp,0,LOCATION_DECK)
	if dct<mct then mct=dct end
	local ctn=true
	while mct>0 and ctn do
		local g=Duel.GetDecktopGroup(1-tp,1)
		Duel.DisableShuffleCheck()
		Duel.Remove(g,POS_FACEDOWN,REASON_EFFECT)
		mct=mct-1
		if mct<1 or not Duel.SelectYesNo(tp,aux.Stringid(80800024,1)) then ctn=false end
	end
end