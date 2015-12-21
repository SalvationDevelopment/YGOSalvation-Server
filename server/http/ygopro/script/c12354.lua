--Buster Trap
function c12354.initial_effect(c)
	--Activate(summon)
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCode(EVENT_SPSUMMON_SUCCESS)
	e1:SetTarget(c12354.target)
	e1:SetOperation(c12354.activate)
	e1:SetCountLimit(1)
	c:RegisterEffect(e1)
end

function c12354.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	local tc=eg:GetFirst()
	if chkc then return chkc==tc end
	if chk==0 then return ep~=tp and eg:GetCount()==1 and tc:IsFaceup() and tc:IsOnField()
		and tc:IsCanBeEffectTarget(e) and tc:IsDestructable() end
	Duel.SetTargetCard(eg)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,tc,1,0,0)
end

function c12354.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		e1:SetCode(EVENT_PHASE+PHASE_BATTLE)
		e1:SetRange(LOCATION_MZONE)
		e1:SetCountLimit(1)
		e1:SetOperation(c12354.thop)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
		tc:RegisterEffect(e1)
	end
end
function c12354.thop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Destroy(e:GetHandler(),nil,REASON_EFFECT)
end