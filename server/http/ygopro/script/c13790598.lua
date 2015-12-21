--Dragoknight Luster Pendulum
function c13790598.initial_effect(c)
	--pendulum summon
	aux.AddPendulumProcedure(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--destroy
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_DESTROY+CATEGORY_DRAW)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_PZONE)
	e2:SetCountLimit(1)
	e2:SetTarget(c13790598.destg)
	e2:SetOperation(c13790598.desop)
	c:RegisterEffect(e2)
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetProperty(EFFECT_FLAG_UNCOPYABLE+EFFECT_FLAG_CANNOT_DISABLE)
	e3:SetCode(EFFECT_CANNOT_BE_XYZ_MATERIAL)
	e3:SetValue(c13790598.matlimit)
	c:RegisterEffect(e3)
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_SINGLE)
	e4:SetCode(EFFECT_CANNOT_BE_SYNCHRO_MATERIAL)
	e4:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e4:SetValue(c13790598.matlimit)
	c:RegisterEffect(e4)
	local e5=Effect.CreateEffect(c)
	e5:SetType(EFFECT_TYPE_SINGLE)
	e5:SetCode(EFFECT_CANNOT_BE_FUSION_MATERIAL)
	e5:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e5:SetValue(c13790598.matlimit)
	c:RegisterEffect(e5)
end
function c13790598.filter2(c,code)
	return c:IsCode(code) and c:IsAbleToHand()
end
function c13790598.destg(e,tp,eg,ep,ev,re,r,rp,chk)
	local seq=e:GetHandler():GetSequence()
	local tc=Duel.GetFieldCard(tp,LOCATION_SZONE,13-seq)
	if chk==0 then return tc and tc:IsDestructable() and 
	Duel.IsExistingMatchingCard(c13790598.filter2,tp,LOCATION_DECK,0,1,nil,tc:GetCode()) end
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,e:GetHandler(),1,0,0)
end
function c13790598.desop(e,tp,eg,ep,ev,re,r,rp)
	local seq=e:GetHandler():GetSequence()
	local tc=Duel.GetFieldCard(tp,LOCATION_SZONE,13-seq)
	if Duel.Destroy(tc,REASON_EFFECT)~=0 then
		Duel.BreakEffect()
		local hc=Duel.GetFirstMatchingCard(c13790598.filter2,tp,LOCATION_DECK,0,nil,tc:GetCode())
		if hc then
			Duel.SendtoHand(hc,nil,REASON_EFFECT)
			Duel.ConfirmCards(1-tp,hc)
		end
	end
end

function c13790598.matlimit(e,c)
	if not c then return false end
	return not c:IsSetCard(0x1e7)
end
